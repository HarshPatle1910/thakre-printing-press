import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../common/Loader';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, hasRole, hasAccess } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullPage text="Authenticating..." />;

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const checkAccess = hasAccess || hasRole;
  if (requiredRole && checkAccess && !checkAccess(requiredRole)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
