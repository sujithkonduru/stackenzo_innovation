import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { session } = useAuth();

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
