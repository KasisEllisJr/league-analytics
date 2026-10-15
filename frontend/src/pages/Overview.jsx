import { useEffect, useState } from "react";
import { Users, Shield } from "lucide-react";

import { championApi, itemApi } from "../services/api";

function Overview() {
  const [championCount, setChampionCount] = useState(null);
  const [itemCount, setItemCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      try {
        const [champions, items] = await Promise.all([
          championApi.getCount(),
          itemApi.getCount(),
        ]);

        if (!cancelled) {
          setChampionCount(champions.totalChampions);
          setItemCount(items.totalItems);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">DASHBOARD / OVERVIEW</p>
          <h1>Data Overview</h1>
          <p className="subtitle">
            Explore League of Legends champion and item data.
          </p>
        </div>

        <span className="patch-badge">PATCH 26.20</span>
      </header>

      {loading && (
        <p role="status">Loading dataset information...</p>
      )}

      {error && (
        <div className="error-message" role="alert">
          Unable to retrieve dashboard data: {error}
        </div>
      )}

      {!loading && !error && (
        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>

            <p className="stat-label">TOTAL CHAMPIONS</p>
            <h2>{championCount}</h2>
            <p className="stat-description">
              Champions stored in SQL Server
            </p>
          </article>

          <article className="stat-card">
            <div className="stat-icon">
              <Shield size={24} />
            </div>

            <p className="stat-label">TOTAL ITEMS</p>
            <h2>{itemCount}</h2>
            <p className="stat-description">
              Items available for analysis
            </p>
          </article>
        </section>
      )}

      <section className="dashboard-panel">
        <h2>About this dataset</h2>

        <p>
          This platform analyzes League of Legends champion
          and item data collected through a Java importer,
          stored in Microsoft SQL Server, and exposed through
          a Spring Boot REST API.
        </p>
      </section>
    </>
  );
}

export default Overview;