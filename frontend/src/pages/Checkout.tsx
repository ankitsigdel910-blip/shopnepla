import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

import {
  Check,
  Banknote,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';

import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/redux';

import {
  clearCart,
} from '../features/cartSlice';

import {
  addressApi,
  couponApi,
  orderApi,
  paymentApi,
} from '../services/orderService';

import {
  getErrorMessage,
} from '../services/api';

import {
  Address,
  PaymentMethod,
} from '../types';

import {
  getProvinces,
  getDistricts,
  getCities,
} from '../utils/nepalLocations';

/* =====================================================
   CONSTANTS
===================================================== */

const STEPS = [
  'Address',
  'Order Summary',
  'Payment',
  'Confirmation',
];

const SHIPPING_FEE = 100;

const emptyAddress = {
  fullName: '',
  phone: '',
  province: '',
  district: '',
  city: '',
  street: '',
  postalCode: '',
};

/* =====================================================
   CHECKOUT
===================================================== */

const Checkout = () => {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const { user } =
    useAppSelector(
      (state) =>
        state.auth
    );

  const { cart } =
    useAppSelector(
      (state) =>
        state.cart
    );

  const [
    step,
    setStep,
  ] = useState(0);

  const [
    addresses,
    setAddresses,
  ] =
    useState<Address[]>(
      []
    );

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState('');

  const [
    newAddress,
    setNewAddress,
  ] =
    useState(
      emptyAddress
    );

  const [
    showNewAddressForm,
    setShowNewAddressForm,
  ] = useState(false);

  const [
    couponCode,
    setCouponCode,
  ] = useState('');

  const [
    discount,
    setDiscount,
  ] = useState(0);

  const [
    couponApplying,
    setCouponApplying,
  ] = useState(false);

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      'cod'
    );

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  const [
    placedOrderId,
    setPlacedOrderId,
  ] =
    useState<
      string | null
    >(null);

  /* ===================================================
     NEPAL LOCATION DATA
  =================================================== */

  const provinces =
    getProvinces();

  const districts =
    newAddress.province
      ? getDistricts(
          newAddress.province
        )
      : [];

  const cities =
    newAddress.province &&
    newAddress.district
      ? getCities(
          newAddress.province,
          newAddress.district
        )
      : [];

  /* ===================================================
     LOAD ADDRESSES
  =================================================== */

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (
      cart.items.length ===
        0 &&
      !placedOrderId
    ) {
      navigate('/cart');
      return;
    }

    addressApi
      .list()
      .then((res) => {
        const list:
          Address[] =
            res.data.data
              .addresses;

        setAddresses(
          list
        );

        const defaultAddress =
          list.find(
            (address) =>
              address.isDefault
          ) || list[0];

        if (
          defaultAddress
        ) {
          setSelectedAddressId(
            defaultAddress._id
          );
        } else {
          setShowNewAddressForm(
            true
          );
        }
      })
      .catch((error) => {
        toast.error(
          getErrorMessage(
            error
          )
        );
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===================================================
     TOTALS
  =================================================== */

  const subtotal =
    cart.totalAmount;

  const total =
    Math.max(
      0,
      subtotal +
        SHIPPING_FEE -
        discount
    );

  /* ===================================================
     ADDRESS HANDLERS
  =================================================== */

  const handleProvinceChange =
    (
      province: string
    ) => {
      setNewAddress(
        (previous) => ({
          ...previous,
          province,
          district: '',
          city: '',
        })
      );
    };

  const handleDistrictChange =
    (
      district: string
    ) => {
      setNewAddress(
        (previous) => ({
          ...previous,
          district,
          city: '',
        })
      );
    };

  /* ===================================================
     SAVE ADDRESS
  =================================================== */

  const saveNewAddress =
    async () => {
      const res =
        await addressApi.create(
          {
            ...newAddress,

            isDefault:
              addresses.length ===
              0,
          }
        );

      const created:
        Address =
          res.data.data
            .address;

      setAddresses(
        (previous) => [
          ...previous,
          created,
        ]
      );

      setSelectedAddressId(
        created._id
      );

      setShowNewAddressForm(
        false
      );

      return created;
    };

  /* ===================================================
     ADDRESS → SUMMARY
  =================================================== */

  const goToSummary =
    async () => {
      if (
        showNewAddressForm
      ) {
        if (
          !newAddress.fullName ||
          !newAddress.phone ||
          !newAddress.province ||
          !newAddress.district ||
          !newAddress.city ||
          !newAddress.street
        ) {
          toast.error(
            'Please fill in all required address fields'
          );

          return;
        }

        try {
          await saveNewAddress();
        } catch (error) {
          toast.error(
            getErrorMessage(
              error
            )
          );

          return;
        }
      } else if (
        !selectedAddressId
      ) {
        toast.error(
          'Please select or add a delivery address'
        );

        return;
      }

      setStep(1);
    };

  /* ===================================================
     COUPON
  =================================================== */

  const applyCoupon =
    async () => {
      const cleanCode =
        couponCode
          .trim()
          .toUpperCase();

      if (!cleanCode) {
        toast.error(
          'Please enter a coupon code'
        );

        return;
      }

      setCouponApplying(
        true
      );

      try {
        const res =
          await couponApi.validate(
            cleanCode,
            subtotal
          );

        const couponDiscount =
          Number(
            res.data.data
              .discount
          );

        setCouponCode(
          cleanCode
        );

        setDiscount(
          couponDiscount
        );

        toast.success(
          `Coupon applied: -Rs. ${couponDiscount.toLocaleString()}`
        );
      } catch (error) {
        setDiscount(0);

        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setCouponApplying(
          false
        );
      }
    };

  /* ===================================================
     PLACE ORDER
  =================================================== */

  const placeOrder =
    async () => {
      if (placingOrder) {
        return;
      }

      const address =
        addresses.find(
          (item) =>
            item._id ===
            selectedAddressId
        );

      if (!address) {
        toast.error(
          'Please select a delivery address'
        );

        return;
      }

      /*
       * Only payment methods currently
       * supported by ShopNepal.
       */
      if (
        paymentMethod !==
          'esewa' &&
        paymentMethod !==
          'cod'
      ) {
        toast.error(
          'Unsupported payment method'
        );

        return;
      }

      setPlacingOrder(
        true
      );

      try {
        const {
          _id,
          isDefault,
          ...shippingAddress
        } = address;

        /*
         * Step 1:
         * Create pending order.
         */
        const res =
          await orderApi.create(
            {
              shippingAddress,

              paymentMethod,

              couponCode:
                discount > 0
                  ? couponCode
                  : undefined,
            }
          );

        const order =
          res.data.data
            .order;

        setPlacedOrderId(
          order._id
        );

        /*
         * Backend clears the persisted
         * cart after order creation.
         *
         * Keep Redux cart synchronized.
         */
        dispatch(
          clearCart()
        );

        /*
         * ==========================================
         * ESEWA
         * ==========================================
         */
        if (
          paymentMethod ===
          'esewa'
        ) {
          try {
            const initRes =
              await paymentApi.initiateEsewa(
                order._id
              );

            const {
              formUrl,
              fields,
            } =
              initRes.data
                .data;

            if (
              !formUrl ||
              !fields
            ) {
              throw new Error(
                'Invalid eSewa payment response'
              );
            }

            /*
             * eSewa expects a normal
             * browser POST form.
             */
            const form =
              document.createElement(
                'form'
              );

            form.method =
              'POST';

            form.action =
              formUrl;

            Object.entries(
              fields
            ).forEach(
              ([
                key,
                value,
              ]) => {
                const input =
                  document.createElement(
                    'input'
                  );

                input.type =
                  'hidden';

                input.name =
                  key;

                input.value =
                  String(
                    value
                  );

                form.appendChild(
                  input
                );
              }
            );

            document.body.appendChild(
              form
            );

            form.submit();

            return;
          } catch (error) {
            /*
             * The order already exists,
             * so give the customer its ID
             * instead of pretending nothing
             * happened.
             */
            toast.error(
              `${getErrorMessage(
                error
              )} Your order was created but payment was not started.`
            );

            navigate(
              `/dashboard/orders/${order._id}`
            );

            return;
          }
        }

        /*
         * ==========================================
         * CASH ON DELIVERY
         * ==========================================
         */

        toast.success(
          'Order placed successfully'
        );

        setStep(3);
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setPlacingOrder(
          false
        );
      }
    };

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="max-w-3xl mx-auto">
      {/* ===============================================
          STEPS
      ================================================ */}

      <div className="flex items-center justify-between mb-10">
        {STEPS.map(
          (
            label,
            index
          ) => (
            <div
              key={label}
              className="flex-1 flex items-center"
            >
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <
                    step
                      ? 'bg-red-600 text-white'
                      : index ===
                        step
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-2 border-red-600'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  {index <
                  step ? (
                    <Check
                      size={
                        16
                      }
                    />
                  ) : (
                    index +
                    1
                  )}
                </div>

                <span className="text-xs mt-1 text-gray-600 dark:text-zinc-400 text-center">
                  {label}
                </span>
              </div>

              {index <
                STEPS.length -
                  1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    index <
                    step
                      ? 'bg-red-600'
                      : 'bg-gray-200 dark:bg-zinc-800'
                  }`}
                />
              )}
            </div>
          )
        )}
      </div>

      {/* ===============================================
          STEP 1 - ADDRESS
      ================================================ */}

      {step === 0 && (
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            Delivery Address
          </h2>

          {/* Existing addresses */}
          {addresses.map(
            (address) => (
              <label
                key={
                  address._id
                }
                className={`block border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedAddressId ===
                    address._id &&
                  !showNewAddressForm
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  className="mr-2"
                  checked={
                    selectedAddressId ===
                      address._id &&
                    !showNewAddressForm
                  }
                  onChange={() => {
                    setSelectedAddressId(
                      address._id
                    );

                    setShowNewAddressForm(
                      false
                    );
                  }}
                />

                <span className="font-medium">
                  {
                    address.fullName
                  }
                </span>

                {' — '}

                {
                  address.phone
                }

                <div className="text-sm text-gray-600 dark:text-zinc-400 ml-5 mt-1">
                  {
                    address.street
                  }
                  ,{' '}
                  {
                    address.city
                  }
                  ,{' '}
                  {
                    address.district
                  }
                  ,{' '}
                  {
                    address.province
                  }

                  {address.postalCode
                    ? ` ${address.postalCode}`
                    : ''}

                  , Nepal
                </div>
              </label>
            )
          )}

          {/* Add address */}
          <button
            type="button"
            className="text-red-600 dark:text-red-400 text-sm font-semibold"
            onClick={() =>
              setShowNewAddressForm(
                (
                  current
                ) =>
                  !current
              )
            }
          >
            {showNewAddressForm
              ? '- Cancel new address'
              : '+ Add a new address'}
          </button>

          {/* New address */}
          {showNewAddressForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="input-field sm:col-span-2"
                placeholder="Full Name"
                value={
                  newAddress.fullName
                }
                onChange={(
                  event
                ) =>
                  setNewAddress(
                    (
                      previous
                    ) => ({
                      ...previous,

                      fullName:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              <input
                className="input-field sm:col-span-2"
                type="tel"
                placeholder="Phone Number"
                value={
                  newAddress.phone
                }
                onChange={(
                  event
                ) =>
                  setNewAddress(
                    (
                      previous
                    ) => ({
                      ...previous,

                      phone:
                        event
                          .target
                          .value,
                    })
                  )
                }
              />

              {/* Country */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Country
                </label>

                <input
                  className="input-field bg-gray-50 dark:bg-zinc-800"
                  value="Nepal"
                  readOnly
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Province *
                </label>

                <select
                  className="input-field"
                  value={
                    newAddress.province
                  }
                  onChange={(
                    event
                  ) =>
                    handleProvinceChange(
                      event
                        .target
                        .value
                    )
                  }
                >
                  <option value="">
                    Select
                    Province
                  </option>

                  {provinces.map(
                    (
                      province
                    ) => (
                      <option
                        key={
                          province
                        }
                        value={
                          province
                        }
                      >
                        {
                          province
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  District *
                </label>

                <select
                  className="input-field"
                  value={
                    newAddress.district
                  }
                  disabled={
                    !newAddress.province
                  }
                  onChange={(
                    event
                  ) =>
                    handleDistrictChange(
                      event
                        .target
                        .value
                    )
                  }
                >
                  <option value="">
                    {newAddress.province
                      ? 'Select District'
                      : 'Select Province First'}
                  </option>

                  {districts.map(
                    (
                      district
                    ) => (
                      <option
                        key={
                          district
                        }
                        value={
                          district
                        }
                      >
                        {
                          district
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  City /
                  Municipality *
                </label>

                <select
                  className="input-field"
                  value={
                    newAddress.city
                  }
                  disabled={
                    !newAddress.province ||
                    !newAddress.district
                  }
                  onChange={(
                    event
                  ) =>
                    setNewAddress(
                      (
                        previous
                      ) => ({
                        ...previous,

                        city:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                >
                  <option value="">
                    {!newAddress.province
                      ? 'Select Province First'
                      : !newAddress.district
                      ? 'Select District First'
                      : 'Select City / Municipality'}
                  </option>

                  {cities.map(
                    (city) => (
                      <option
                        key={
                          city
                        }
                        value={
                          city
                        }
                      >
                        {
                          city
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Postal code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Postal Code
                </label>

                <input
                  className="input-field"
                  placeholder="Optional"
                  value={
                    newAddress.postalCode
                  }
                  onChange={(
                    event
                  ) =>
                    setNewAddress(
                      (
                        previous
                      ) => ({
                        ...previous,

                        postalCode:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </div>

              {/* Street */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Street
                  Address *
                </label>

                <input
                  className="input-field"
                  placeholder="Tole, Ward, Street, House Number"
                  value={
                    newAddress.street
                  }
                  onChange={(
                    event
                  ) =>
                    setNewAddress(
                      (
                        previous
                      ) => ({
                        ...previous,

                        street:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn-primary w-full"
            onClick={
              goToSummary
            }
          >
            Continue to Order
            Summary
          </button>
        </div>
      )}

      {/* ===============================================
          STEP 2 - ORDER SUMMARY
      ================================================ */}

      {step === 1 && (
        <div className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            Order Summary
          </h2>

          {cart.items.map(
            (item) => (
              <div
                key={
                  item.product
                    ._id
                }
                className="flex justify-between gap-4 text-sm border-b border-gray-200 dark:border-zinc-800 pb-2"
              >
                <span>
                  {
                    item.product
                      .name
                  }{' '}
                  ×{' '}
                  {
                    item.quantity
                  }
                </span>

                <span className="font-medium whitespace-nowrap">
                  Rs.{' '}
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString()}
                </span>
              </div>
            )
          )}

          {/* Coupon */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input-field"
              placeholder="Coupon code"
              value={
                couponCode
              }
              onChange={(
                event
              ) =>
                setCouponCode(
                  event
                    .target
                    .value
                )
              }
            />

            <button
              type="button"
              className="btn-secondary sm:w-auto"
              onClick={
                applyCoupon
              }
              disabled={
                couponApplying
              }
            >
              {couponApplying
                ? 'Applying...'
                : 'Apply'}
            </button>
          </div>

          {/* Price */}
          <div className="text-sm space-y-2 pt-2">
            <div className="flex justify-between">
              <span>
                Subtotal
              </span>

              <span>
                Rs.{' '}
                {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Shipping
              </span>

              <span>
                Rs.{' '}
                {SHIPPING_FEE.toLocaleString()}
              </span>
            </div>

            {discount >
              0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>
                  Discount
                </span>

                <span>
                  -Rs.{' '}
                  {discount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-zinc-800 pt-3">
              <span>
                Total
              </span>

              <span>
                Rs.{' '}
                {total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() =>
                setStep(0)
              }
            >
              Back
            </button>

            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() =>
                setStep(2)
              }
            >
              Continue to
              Payment
            </button>
          </div>
        </div>
      )}

      {/* ===============================================
          STEP 3 - PAYMENT
      ================================================ */}

      {step === 2 && (
        <div className="card p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-lg">
              Payment Method
            </h2>

            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Choose how you
              would like to pay.
            </p>
          </div>

          {/* eSewa */}
          <label
            className={`block border rounded-xl p-4 cursor-pointer transition-all ${
              paymentMethod ===
              'esewa'
                ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                : 'border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment"
                value="esewa"
                checked={
                  paymentMethod ===
                  'esewa'
                }
                onChange={() =>
                  setPaymentMethod(
                    'esewa'
                  )
                }
                className="mt-1"
              />

              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                <WalletCards
                  size={20}
                />
              </div>

              <div>
                <div className="font-semibold">
                  eSewa
                </div>

                <div className="text-sm text-gray-600 dark:text-zinc-400 mt-0.5">
                  Pay securely
                  with your eSewa
                  wallet.
                </div>

                <div className="inline-flex items-center gap-1 mt-2 text-xs text-green-700 dark:text-green-400">
                  <ShieldCheck
                    size={13}
                  />

                  Secure online
                  payment
                </div>
              </div>
            </div>
          </label>

          {/* COD */}
          <label
            className={`block border rounded-xl p-4 cursor-pointer transition-all ${
              paymentMethod ===
              'cod'
                ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                : 'border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={
                  paymentMethod ===
                  'cod'
                }
                onChange={() =>
                  setPaymentMethod(
                    'cod'
                  )
                }
                className="mt-1"
              />

              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Banknote
                  size={20}
                />
              </div>

              <div>
                <div className="font-semibold">
                  Cash on
                  Delivery
                </div>

                <div className="text-sm text-gray-600 dark:text-zinc-400 mt-0.5">
                  Pay in cash
                  when your order
                  arrives.
                </div>
              </div>
            </div>
          </label>

          {/* Total */}
          <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-zinc-800 pt-4">
            <span>
              Total to pay
            </span>

            <span className="text-red-600 dark:text-red-400">
              Rs.{' '}
              {total.toLocaleString()}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() =>
                setStep(1)
              }
              disabled={
                placingOrder
              }
            >
              Back
            </button>

            <button
              type="button"
              className="btn-primary flex-1"
              onClick={
                placeOrder
              }
              disabled={
                placingOrder
              }
            >
              {placingOrder
                ? paymentMethod ===
                  'esewa'
                  ? 'Starting eSewa...'
                  : 'Placing order...'
                : paymentMethod ===
                  'esewa'
                ? 'Pay with eSewa'
                : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* ===============================================
          STEP 4 - CONFIRMATION
      ================================================ */}

      {step === 3 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check
              size={28}
            />
          </div>

          <h2 className="text-xl font-bold mb-2">
            Order placed
            successfully!
          </h2>

          <p className="text-gray-600 dark:text-zinc-400 text-sm mb-6">
            You'll pay in cash
            when your order is
            delivered.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {placedOrderId ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  navigate(
                    `/dashboard/orders/${placedOrderId}`
                  )
                }
              >
                View Order
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  navigate(
                    '/dashboard/orders'
                  )
                }
              >
                View My Orders
              </button>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                navigate(
                  '/shop'
                )
              }
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;