import { useAuth } from '../context/AuthContext';

export default function Tours() {
  const { user } = useAuth();

  return (
    <main className="page">
      <h1>Tours</h1>
      <p>Tour listing will be added next. You are signed in as {user?.name || user?.email}.</p>
    </main>
  );
}
