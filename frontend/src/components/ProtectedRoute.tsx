import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user, status } = useAppSelector((s) => s.auth);

  if (status === 'loading' || status === 'idle') {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
