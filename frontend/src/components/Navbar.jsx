import { Link, NavLink, useNavigate } from 'react-router-dom';
import { canManageTours } from './RoleRoute';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="nav">
      <Link to="/" className="brand">Natours</Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/tours">Tours</NavLink>
        {loading ? null : user ? (
          <>
            <NavLink to="/bookings">Bookings</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            {canManageTours(user.role) ? (
              <NavLink to="/admin">Admin</NavLink>
            ) : null}
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Signup</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
