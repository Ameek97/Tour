import { Link } from 'react-router-dom';

export default function TourCard({ tour }) {
  const imageSrc =
    tour.imageCover && String(tour.imageCover).startsWith('http')
      ? tour.imageCover
      : null;

  const location =
    tour.startLocation?.description ||
    tour.startLocation?.address ||
    null;

  return (
    <Link to={`/tours/${tour._id}`} className="tour-card-link">
      <article className="tour-card">
        {imageSrc ? (
          <img className="tour-card-image" src={imageSrc} alt="" />
        ) : null}
        <div className="tour-card-body">
          <h2>{tour.name}</h2>
          {tour.summary ? <p>{tour.summary}</p> : null}
          <p className="tour-card-meta">
            <strong>${tour.price}</strong>
            {tour.ratingAverage != null ? ` · Rating ${tour.ratingAverage}` : null}
            {tour.rating != null ? ` · Stars ${tour.rating}` : null}
            {typeof tour.distance === 'number'
              ? ` · ${tour.distance.toFixed(1)} away`
              : null}
          </p>
          {location ? <p className="tour-card-location">{location}</p> : null}
        </div>
      </article>
    </Link>
  );
}
