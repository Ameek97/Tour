import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TourCard from '../components/TourCard';
import {
  getTopCheapTours,
  getTours,
  getToursWithin,
  PAGE_SIZE
} from '../services/tourService';

const PAGE_SIZE_OPTIONS = [3, 6, 12];

export default function Tours() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');

  const [cheapTours, setCheapTours] = useState([]);
  const [cheapLoading, setCheapLoading] = useState(true);
  const [cheapError, setCheapError] = useState('');

  const [nearTours, setNearTours] = useState([]);
  const [nearSearched, setNearSearched] = useState(false);
  const [nearLoading, setNearLoading] = useState(false);
  const [nearError, setNearError] = useState('');

  const minPrice = searchParams.get('price[gte]') || '';
  const maxPrice = searchParams.get('price[lte]') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page') || 1);
  const limitParam = Number(searchParams.get('limit'));
  const limit = PAGE_SIZE_OPTIONS.includes(limitParam) ? limitParam : PAGE_SIZE;

  useEffect(() => {
    let cancelled = false;

    async function loadCheap() {
      setCheapLoading(true);
      setCheapError('');
      try {
        const data = await getTopCheapTours();
        if (!cancelled) {
          setCheapTours(data.data?.tours || []);
        }
      } catch (err) {
        if (!cancelled) {
          setCheapTours([]);
          setCheapError(err.message || 'Unable to load best value tours.');
        }
      } finally {
        if (!cancelled) {
          setCheapLoading(false);
        }
      }
    }

    loadCheap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTours() {
      setLoading(true);
      setError('');
      try {
        const data = await getTours({
          minPrice,
          maxPrice,
          sort,
          page,
          limit
        });
        if (!cancelled) {
          setTours(data.data?.tours || []);
          setResultCount(Number(data.result) || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setTours([]);
          setResultCount(0);
          setError(err.message || 'Unable to load tours.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTours();
    return () => {
      cancelled = true;
    };
  }, [minPrice, maxPrice, sort, page, limit]);

  function updateQuery(updates, { resetPage } = { resetPage: false }) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value == null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (resetPage) {
      next.set('page', '1');
    }

    setSearchParams(next);
  }

  function parsePriceInput(raw, label) {
    const text = raw?.toString().trim() || '';
    if (text === '') {
      return { value: '' };
    }
    if (!/^\d+(\.\d+)?$/.test(text)) {
      return { error: `${label} must be a valid non-negative number.` };
    }
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) {
      return { error: `${label} cannot be negative.` };
    }
    return { value: String(value) };
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    setFilterError('');
    const form = new FormData(event.target);
    const minParsed = parsePriceInput(form.get('minPrice'), 'Minimum price');
    const maxParsed = parsePriceInput(form.get('maxPrice'), 'Maximum price');

    if (minParsed.error) {
      setFilterError(minParsed.error);
      return;
    }
    if (maxParsed.error) {
      setFilterError(maxParsed.error);
      return;
    }

    if (minParsed.value !== '' && maxParsed.value !== '') {
      if (Number(minParsed.value) > Number(maxParsed.value)) {
        setFilterError('Minimum price cannot be greater than maximum price.');
        return;
      }
    }

    updateQuery(
      {
        'price[gte]': minParsed.value,
        'price[lte]': maxParsed.value,
        sort: form.get('sort') || '',
        limit: form.get('limit') || String(PAGE_SIZE)
      },
      { resetPage: true }
    );
  }

  function clearFilters() {
    setFilterError('');
    setSearchParams(new URLSearchParams({ page: '1' }));
  }

  const hasActiveFilters = Boolean(minPrice || maxPrice || sort);

  async function handleNearSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const distance = form.get('distance')?.toString().trim();
    const lat = form.get('lat')?.toString().trim();
    const lng = form.get('lng')?.toString().trim();
    const unit = form.get('unit') === 'mi' ? 'mi' : 'km';

    setNearSearched(true);
    setNearLoading(true);
    setNearError('');
    setNearTours([]);

    try {
      const data = await getToursWithin({ distance, lat, lng, unit });
      setNearTours(data.data?.tours || []);
    } catch (err) {
      setNearError(err.message || 'Unable to search nearby tours.');
    } finally {
      setNearLoading(false);
    }
  }

  const hasPrevious = page > 1;
  const hasNext = resultCount >= limit;

  return (
    <main className="page page-wide">
      <h1>Tours</h1>

      <section className="tour-section">
        <h2>Best Value Tours</h2>
        {cheapLoading ? <p className="status">Loading best value tours...</p> : null}
        {cheapError ? <p className="error">{cheapError}</p> : null}
        {!cheapLoading && !cheapError && cheapTours.length === 0 ? (
          <p>No best value tours found.</p>
        ) : null}
        <div className="tour-grid">
          {cheapTours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      </section>

      <section className="tour-section">
        <h2>Find tours near a location</h2>
        <form className="tour-filters" onSubmit={handleNearSubmit}>
          <label>
            Distance
            <input type="number" name="distance" min="0.01" step="any" required />
          </label>
          <label>
            Latitude
            <input type="number" name="lat" min="-90" max="90" step="any" required />
          </label>
          <label>
            Longitude
            <input type="number" name="lng" min="-180" max="180" step="any" required />
          </label>
          <label>
            Unit
            <select name="unit" defaultValue="km">
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </label>
          <button type="submit">Search</button>
        </form>
        {nearLoading ? <p className="status">Searching nearby tours...</p> : null}
        {nearError ? <p className="error">{nearError}</p> : null}
        {!nearLoading && !nearError && nearSearched && nearTours.length === 0 ? (
          <p>No tours found in this area.</p>
        ) : null}
        <div className="tour-grid">
          {nearTours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      </section>

      <section className="tour-section">
        <h2>Browse tours</h2>
        <form className="tour-filters" onSubmit={handleFilterSubmit}>
          <label>
            Minimum Price
            <input
              type="number"
              name="minPrice"
              min="0"
              defaultValue={minPrice}
              key={`min-${minPrice}`}
            />
          </label>
          <label>
            Maximum Price
            <input
              type="number"
              name="maxPrice"
              min="0"
              defaultValue={maxPrice}
              key={`max-${maxPrice}`}
            />
          </label>
          <label>
            Sort
            <select name="sort" defaultValue={sort} key={`sort-${sort}`}>
              <option value="">Default</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-ratingAverage">Rating: High to Low</option>
            </select>
          </label>
          <label>
            Page size
            <select name="limit" defaultValue={String(limit)} key={`limit-${limit}`}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Apply Filters</button>
          <button type="button" className="secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </form>
        {filterError ? <p className="error">{filterError}</p> : null}

        {loading ? <p className="status">Loading tours...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {!loading && !error && tours.length === 0 ? (
          <p>
            No tours found.
            {hasActiveFilters ? (
              <>
                {' '}
                <button type="button" className="link-button" onClick={clearFilters}>
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        ) : null}

        <div className="tour-grid">
          {tours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>

        <div className="pagination">
          <button
            type="button"
            disabled={!hasPrevious || loading}
            onClick={() => updateQuery({ page: page - 1 })}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => updateQuery({ page: page + 1 })}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
