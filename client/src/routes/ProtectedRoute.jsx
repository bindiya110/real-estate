import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/States';

/** Renders child routes only for signed-in users; others are sent to login and returned afterwards. */
export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** For login/register pages: signed-in users go straight to their dashboard. */
export function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (user) return <Navigate to={location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard')} replace />;
  return <Outlet />;
}
