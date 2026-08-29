import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function canManageTours(role) {
  return role === 'admin' || role === 'lead guide';
}

export default function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="status">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/tours" replace />;
  }

  return children;
}
