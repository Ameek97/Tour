import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="page">
      <h1>Natours</h1>
      <p>Book nature tours. Sign in to browse available tours.</p>
      {user ? (
        <p>
          Welcome back, {user.name || user.email}. <Link to="/tours">View tours</Link>
        </p>
      ) : (
        <p>
          <Link to="/login">Login</Link> or <Link to="/signup">create an account</Link>.
        </p>
      )}
    </main>
  );
}
