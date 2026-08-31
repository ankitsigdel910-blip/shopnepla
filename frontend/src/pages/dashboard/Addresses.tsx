import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Star } from 'lucide-react';
import { addressApi } from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Address } from '../../types';

const emptyForm = { fullName: '', phone: '', province: '', district: '', city: '', street: '', postalCode: '' };

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => addressApi.list().then((res) => setAddresses(res.data.data.addresses)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addressApi.create(form);
      toast.success('Address added');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const setDefault = async (id: string) => {
    await addressApi.update(id, { isDefault: true });
    load();
  };

  const remove = async (id: string) => {
    await addressApi.remove(id);
    load();
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Addresses</h1>
        <button className="btn-primary text-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-4 grid grid-cols-2 gap-3 mb-6">
          <input className="input-field col-span-2" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
          <input className="input-field col-span-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          <input className="input-field" placeholder="Province" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} required />
          <input className="input-field" placeholder="District" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} required />
          <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
          <input className="input-field" placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
          <input className="input-field col-span-2" placeholder="Street Address" value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} required />
          <button className="btn-primary col-span-2">Save Address</button>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a._id} className="card p-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{a.fullName}</span>
                {a.isDefault && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Default</span>}
              </div>
              <p className="text-sm text-gray-600">{a.phone}</p>
              <p className="text-sm text-gray-600">{a.street}, {a.city}, {a.district}, {a.province} {a.postalCode}</p>
            </div>
            <div className="flex gap-2">
              {!a.isDefault && (
                <button title="Set as default" onClick={() => setDefault(a._id)} className="p-2 hover:bg-gray-50 rounded-lg">
                  <Star size={16} />
                </button>
              )}
              <button title="Delete" onClick={() => remove(a._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && <p className="text-gray-500 text-sm">No saved addresses yet.</p>}
      </div>
    </div>
  );
};

export default Addresses;
