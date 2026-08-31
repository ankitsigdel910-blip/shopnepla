import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/authService';
import { getErrorMessage } from '../../services/api';

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.changePassword(form);
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Change Password</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="input-field" type="password" placeholder="Current password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} required />
        <input className="input-field" type="password" placeholder="New password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} minLength={8} required />
        <input className="input-field" type="password" placeholder="Confirm new password" value={form.confirmNewPassword} onChange={(e) => setForm((f) => ({ ...f, confirmNewPassword: e.target.value }))} minLength={8} required />
        <button className="btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
};

export default ChangePassword;
