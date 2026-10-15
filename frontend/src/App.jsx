import { useEffect, useState } from "react";

import { championApi, itemApi } from "./services/api";

import "./App.css";

function App() {
  const [championCount, setChampionCount] = useState(null);
  const [itemCount, setItemCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
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

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <p className="eyebrow">LEAGUE ANALYTICS</p>
          <h1>Data Overview</h1>
          <p className="subtitle">
            League of Legends champion and item statistics
          </p>
        </div>

        <div className="patch-badge">
          PATCH 26.20
        </div>
      </header>

      {loading && (
        <p role="status">Loading analytics data...</p>
      )}

      {error && (
        <p className="error-message" role="alert">
          Unable to connect to API: {error}
        </p>
      )}

      {!loading && !error && (
        <section className="stats-grid">

          <article className="stat-card">
            <p className="stat-label">TOTAL CHAMPIONS</p>

            <h2>{championCount}</h2>

            <p className="stat-description">
              Champion records stored in SQL Server
            </p>
          </article>

          <article className="stat-card">
            <p className="stat-label">TOTAL ITEMS</p>

            <h2>{itemCount}</h2>

            <p className="stat-description">
              Item records available for analysis
            </p>
          </article>

        </section>
      )}

      <footer className="dashboard-footer">
        Java · Spring Boot · SQL Server · React
      </footer>

    </div>
  );
}

export default App;