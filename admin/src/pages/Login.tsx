import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../hooks/redux';
import { adminLogin } from '../features/authSlice';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(adminLogin(form));
    setLoading(false);
    if (adminLogin.fulfilled.match(result)) {
      navigate('/');
    } else {
      toast.error((result.payload as string) || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">ShopNepal Admin</h1>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="input-field mt-1" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input className="input-field mt-1" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
      </form>
    </div>
  );
};

export default Login;
