import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

const ProtectedAdminRoute = () => {
  const { user, checked } = useAppSelector((s) => s.auth);
  if (!checked) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedAdminRoute;
