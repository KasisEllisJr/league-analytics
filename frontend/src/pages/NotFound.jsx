import { Link } from "react-router-dom";
import { House, SearchX } from "lucide-react";

function NotFound() {
  return (
    <section className="not-found-page">
      <SearchX size={46} aria-hidden="true" />

      <p className="eyebrow">ERROR 404</p>

      <h1>Page Not Found</h1>

      <p>
        The page you requested doesn't exist
        in the League Analytics dashboard.
      </p>

      <Link to="/" className="compare-link-button">
        <House size={17} />
        Return to Overview
      </Link>
    </section>
  );
}

export default NotFound;