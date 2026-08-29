import { useEffect, useState } from 'react';
import { getTourStats } from '../services/tourService';

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) {
    return '—';
  }
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: digits
  });
}

export default function TourStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError('');
      try {
        const data = await getTourStats();
        if (!cancelled) {
          setStats(data.data?.stats || null);
        }
      } catch (err) {
        if (!cancelled) {
          setStats(null);
          setError(err.message || 'Unable to load tour statistics.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const distribution = stats?.ratingDistribution || {};
  const tourCount = stats?.numberOfTours;
  const isEmpty = !loading && !error && (tourCount === 0 || tourCount == null);

  return (
    <main className="page page-wide">
      <h1>Tour Stats</h1>
      {loading ? <p className="status">Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {isEmpty ? <p>No tour statistics are available yet.</p> : null}
      {!loading && !error && stats && tourCount > 0 ? (
        <>
          <ul className="stats-grid">
            <li className="stats-card">
              <h2>Number of tours</h2>
              <p>{formatNumber(stats.numberOfTours, 0)}</p>
            </li>
            <li className="stats-card">
              <h2>Average rating</h2>
              <p>{formatNumber(stats.avgRating)}</p>
            </li>
            <li className="stats-card">
              <h2>Average price</h2>
              <p>${formatNumber(stats.avgPrice, 0)}</p>
            </li>
            <li className="stats-card">
              <h2>Minimum price</h2>
              <p>${formatNumber(stats.minPrice, 0)}</p>
            </li>
            <li className="stats-card">
              <h2>Maximum price</h2>
              <p>${formatNumber(stats.maxPrice, 0)}</p>
            </li>
          </ul>
          <section>
            <h2>Rating distribution</h2>
            <ul className="stats-grid">
              {[5, 4, 3, 2, 1].map((star) => (
                <li key={star} className="stats-card">
                  <h2>{star} star</h2>
                  <p>{formatNumber(distribution[star], 0)}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  );
}
