import {
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  Plus,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import api, {
  getErrorMessage,
} from '../services/api';

// ============================================================
// TYPES
// ============================================================

interface Product {
  _id: string;
  name: string;
  description?: string;

  price: number;
  discountPrice?: number;

  brand?: string;

  stock: number;
  sku: string;

  isActive: boolean;
  isFeatured: boolean;

  category:
    | {
        _id: string;
        name: string;
      }
    | string;

  images: string[];
}

interface Category {
  _id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================
// EMPTY PRODUCT FORM
// ============================================================

const emptyForm = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  brand: '',
  stock: '',
  sku: '',
  isFeatured: false,
};

// ============================================================
// PRODUCTS PAGE
// ============================================================

const Products = () => {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState(emptyForm);

  const [imageFiles, setImageFiles] =
    useState<FileList | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState('');

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

  // ==========================================================
  // LOAD PRODUCTS + CATEGORIES
  // ==========================================================

  const load = async () => {
    try {
      setLoading(true);

      const [
        productResponse,
        categoryResponse,
      ] = await Promise.all([
        api.get(
          '/admin/products',
          {
            params: {
              search:
                search ||
                undefined,

              page,

              limit: 20,
            },
          }
        ),

        api.get(
          '/categories',
          {
            params: {
              all: true,
            },
          }
        ),
      ]);

      const data =
        productResponse.data.data;

      setProducts(
        data.products || []
      );

      if (data.pagination) {
        setPagination(
          data.pagination
        );
      }

      setCategories(
        categoryResponse.data
          .data.categories || []
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD WHEN PAGE/SEARCH CHANGES
  // ==========================================================

  useEffect(() => {
    load();
  }, [page, search]);

  // ==========================================================
  // RESET TO PAGE 1 WHEN SEARCHING
  // ==========================================================

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setForm(emptyForm);

    setEditingId(null);

    setImageFiles(null);

    setShowForm(false);
  };

  // ==========================================================
  // CREATE PRODUCT
  // ==========================================================

  const startCreate = () => {
    resetForm();

    setShowForm(true);
  };

  // ==========================================================
  // EDIT PRODUCT
  // ==========================================================

  const startEdit = (
    product: Product
  ) => {
    setEditingId(
      product._id
    );

    setForm({
      name:
        product.name,

      description:
        product.description ||
        '',

      price:
        String(
          product.price
        ),

      discountPrice:
        product.discountPrice !=
        null
          ? String(
              product.discountPrice
            )
          : '',

      category:
        typeof product.category ===
        'object'
          ? product.category
              ._id
          : product.category,

      brand:
        product.brand || '',

      stock:
        String(
          product.stock
        ),

      sku:
        product.sku,

      isFeatured:
        product.isFeatured,
    });

    setImageFiles(null);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ==========================================================
  // SUBMIT PRODUCT
  // ==========================================================

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData =
        new FormData();

      Object.entries(
        form
      ).forEach(
        ([key, value]) => {
          formData.append(
            key,
            String(value)
          );
        }
      );

      if (imageFiles) {
        Array.from(
          imageFiles
        ).forEach(
          (file) => {
            formData.append(
              'images',
              file
            );
          }
        );
      }

      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

        toast.success(
          'Product updated'
        );
      }

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {
        await api.post(
          '/products',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

        toast.success(
          'Product created'
        );
      }

      resetForm();

      await load();
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // TOGGLE PRODUCT STATUS
  // ==========================================================

  const toggleStatus =
    async (
      id: string
    ) => {
      try {
        await api.put(
          `/products/${id}/toggle-status`
        );

        toast.success(
          'Product status updated'
        );

        await load();
      } catch (error) {
        toast.error(
          getErrorMessage(error)
        );
      }
    };

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  const remove = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to permanently delete this product?'
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/products/${id}`
      );

      toast.success(
        'Product deleted'
      );

      /*
       * If the final product on the
       * current page was deleted,
       * move back one page.
       */
      if (
        products.length === 1 &&
        page > 1
      ) {
        setPage(
          page - 1
        );
      } else {
        await load();
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  // ==========================================================
  // PAGINATION CALCULATIONS
  // ==========================================================

  const startItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1;

  const endItem =
    Math.min(
      pagination.page *
        pagination.limit,
      pagination.total
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Products
        </h1>

        <div className="flex gap-3">

          <input
            className="input-field w-56"
            placeholder="Search products..."
            value={search}
            onChange={(
              e
            ) =>
              handleSearch(
                e.target.value
              )
            }
          />

          <button
            type="button"
            className="btn-primary flex items-center gap-2"
            onClick={
              startCreate
            }
          >
            <Plus size={16} />

            Add Product
          </button>

        </div>
      </div>

      {/* =====================================================
          PRODUCT FORM
      ====================================================== */}

      {showForm && (
        <form
          onSubmit={submit}
          className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3"
        >

          {/* NAME */}

          <input
            className="input-field md:col-span-2"
            placeholder="Product name"
            value={
              form.name
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  name:
                    e.target
                      .value,
                })
              )
            }
            required
          />

          {/* DESCRIPTION */}

          <textarea
            className="input-field md:col-span-2"
            placeholder="Description"
            rows={3}
            value={
              form.description
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  description:
                    e.target
                      .value,
                })
              )
            }
            required={
              !editingId
            }
          />

          {/* PRICE */}

          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Price"
            value={
              form.price
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  price:
                    e.target
                      .value,
                })
              )
            }
            required
          />

          {/* DISCOUNT */}

          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Discount price (optional)"
            value={
              form.discountPrice
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  discountPrice:
                    e.target
                      .value,
                })
              )
            }
          />

          {/* CATEGORY */}

          <select
            className="input-field"
            value={
              form.category
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  category:
                    e.target
                      .value,
                })
              )
            }
            required
          >
            <option value="">
              Select category
            </option>

            {categories.map(
              (
                category
              ) => (
                <option
                  key={
                    category._id
                  }
                  value={
                    category._id
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>

          {/* BRAND */}

          <input
            className="input-field"
            placeholder="Brand"
            value={
              form.brand
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  brand:
                    e.target
                      .value,
                })
              )
            }
          />

          {/* STOCK */}

          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Stock"
            value={
              form.stock
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  stock:
                    e.target
                      .value,
                })
              )
            }
            required
          />

          {/* SKU */}

          <input
            className="input-field"
            placeholder="SKU"
            value={
              form.sku
            }
            onChange={(
              e
            ) =>
              setForm(
                (current) => ({
                  ...current,
                  sku:
                    e.target
                      .value,
                })
              )
            }
            required
          />

          {/* FEATURED */}

          <label className="flex items-center gap-2 text-sm md:col-span-2">

            <input
              type="checkbox"
              checked={
                form.isFeatured
              }
              onChange={(
                e
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,

                    isFeatured:
                      e.target
                        .checked,
                  })
                )
              }
            />

            Featured product
          </label>

          {/* IMAGES */}

          <div className="md:col-span-2">

            <label className="text-sm font-medium block mb-1">
              Product images
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(
                e
              ) =>
                setImageFiles(
                  e.target.files
                )
              }
            />

          </div>

          {/* FORM ACTIONS */}

          <div className="md:col-span-2 flex gap-3">

            <button
              type="submit"
              className="btn-primary"
              disabled={
                saving
              }
            >
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Product'
                : 'Create Product'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={
                resetForm
              }
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <div className="text-gray-500">
          Loading...
        </div>
      ) : (
        <>
          {/* =================================================
              PRODUCTS TABLE
          ================================================== */}

          <div className="card overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-left text-gray-500">

                <tr>
                  <th className="p-3">
                    Product
                  </th>

                  <th className="p-3">
                    SKU
                  </th>

                  <th className="p-3">
                    Category
                  </th>

                  <th className="p-3">
                    Price
                  </th>

                  <th className="p-3">
                    Stock
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {/* NO PRODUCTS */}

                {products.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                      className="p-8 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map(
                    (
                      product
                    ) => (
                      <tr
                        key={
                          product._id
                        }
                        className="border-t hover:bg-gray-50"
                      >

                        {/* PRODUCT */}

                        <td className="p-3">

                          <div className="flex items-center gap-2">

                            <img
                              src={
                                product
                                  .images?.[0] ||
                                'https://placehold.co/40x40'
                              }
                              className="w-10 h-10 rounded object-cover"
                              alt={
                                product.name
                              }
                            />

                            <span>
                              {
                                product.name
                              }
                            </span>

                          </div>

                        </td>

                        {/* SKU */}

                        <td className="p-3">
                          {
                            product.sku
                          }
                        </td>

                        {/* CATEGORY */}

                        <td className="p-3">
                          {typeof product.category ===
                          'object'
                            ? product
                                .category
                                .name
                            : ''}
                        </td>

                        {/* PRICE */}

                        <td className="p-3">

                          {product.discountPrice !=
                            null &&
                          product.discountPrice <
                            product.price ? (
                            <div>
                              <span>
                                Rs.{' '}
                                {product.discountPrice.toLocaleString()}
                              </span>

                              <span className="ml-2 text-xs text-gray-400 line-through">
                                Rs.{' '}
                                {product.price.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <>
                              Rs.{' '}
                              {product.price.toLocaleString()}
                            </>
                          )}

                        </td>

                        {/* STOCK */}

                        <td className="p-3">
                          {
                            product.stock
                          }
                        </td>

                        {/* STATUS */}

                        <td className="p-3">

                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              product.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {product.isActive
                              ? 'Active'
                              : 'Disabled'}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="p-3">

                          <div className="flex gap-2">

                            <button
                              type="button"
                              title="Edit product"
                              onClick={() =>
                                startEdit(
                                  product
                                )
                              }
                              className="p-1.5 hover:bg-gray-100 rounded"
                            >
                              <Pencil
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title={
                                product.isActive
                                  ? 'Disable product'
                                  : 'Enable product'
                              }
                              onClick={() =>
                                toggleStatus(
                                  product._id
                                )
                              }
                              className="p-1.5 hover:bg-gray-100 rounded"
                            >
                              <Power
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Delete product"
                              onClick={() =>
                                remove(
                                  product._id
                                )
                              }
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                            >
                              <Trash2
                                size={
                                  14
                                }
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================== */}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* PRODUCT COUNT */}

            <div className="text-sm text-gray-500">

              Showing{' '}

              <span className="font-medium text-gray-700">
                {startItem}
              </span>

              {' - '}

              <span className="font-medium text-gray-700">
                {endItem}
              </span>

              {' of '}

              <span className="font-medium text-gray-700">
                {pagination.total}
              </span>

              {' products'}

            </div>

            {/* PAGE CONTROLS */}

            <div className="flex items-center gap-2">

              {/* PREVIOUS */}

              <button
                type="button"
                className="btn-secondary flex items-center gap-1"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
              >
                <ChevronLeft
                  size={
                    16
                  }
                />

                Previous
              </button>

              {/* PAGE NUMBERS */}

              {Array.from(
                {
                  length:
                    pagination.totalPages,
                },
                (
                  _,
                  index
                ) =>
                  index +
                  1
              ).map(
                (
                  pageNumber
                ) => (
                  <button
                    type="button"
                    key={
                      pageNumber
                    }
                    onClick={() =>
                      setPage(
                        pageNumber
                      )
                    }
                    className={`w-9 h-9 rounded-md text-sm font-medium ${
                      page ===
                      pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {
                      pageNumber
                    }
                  </button>
                )
              )}

              {/* NEXT */}

              <button
                type="button"
                className="btn-secondary flex items-center gap-1"
                disabled={
                  page >=
                  pagination.totalPages
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.min(
                        pagination.totalPages,
                        current +
                          1
                      )
                  )
                }
              >
                Next

                <ChevronRight
                  size={
                    16
                  }
                />
              </button>

            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default Products;