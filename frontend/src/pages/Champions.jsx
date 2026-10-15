import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { championApi } from "../services/api";
import ErrorState from "../components/ErrorState";
import ChampionImage from "../components/ChampionImage";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "name", label: "Champion Name" },
  { value: "healthBase", label: "Base Health" },
  { value: "armorBase", label: "Base Armor" },
  { value: "attackDamageBase", label: "Attack Damage" },
  { value: "magicResistBase", label: "Magic Resist" },
  { value: "movementSpeed", label: "Movement Speed" },
  { value: "attackRange", label: "Attack Range" },
];

function getRoles(champion) {
  if (!champion.roles) {
    return [];
  }

  return champion.roles
    .split(/[|,]/)
    .map((role) => role.trim())
    .filter(Boolean);
}

function formatStat(value) {
  return value == null ? "—" : value;
}

function Champions() {
  const [champions, setChampions] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] =
    useState("asc");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load all champions from Spring Boot
  useEffect(() => {
    let cancelled = false;

    async function loadChampions() {
      setLoading(true);
      setError(null);
      try {
        const data = await championApi.getAll();

        if (!cancelled) {
          setChampions(data);
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

    loadChampions();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Build role filters from the actual dataset
  const roles = useMemo(() => {
    const uniqueRoles = new Set();

    champions.forEach((champion) => {
      getRoles(champion).forEach((role) =>
        uniqueRoles.add(role)
      );
    });

    return [...uniqueRoles].sort();
  }, [champions]);

  // Apply search, role filtering and sorting
  const filteredChampions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = champions.filter((champion) => {
      const matchesName = champion.championName
        .toLowerCase()
        .includes(query);

      const matchesRole =
        selectedRole === "all" ||
        getRoles(champion).includes(selectedRole);

      return matchesName && matchesRole;
    });

    result.sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.championName.localeCompare(
          b.championName
        );

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      }

      const aValue = a[sortBy];
      const bValue = b[sortBy];

      // Keep missing numeric values at the end
      if (aValue == null && bValue == null) {
        return 0;
      }

      if (aValue == null) {
        return 1;
      }

      if (bValue == null) {
        return -1;
      }

      const comparison = aValue - bValue;

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    champions,
    search,
    selectedRole,
    sortBy,
    sortDirection,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredChampions.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleChampions = filteredChampions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function resetPage() {
    setPage(1);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            DATABASE / CHAMPIONS
          </p>

          <h1>Champion Explorer</h1>

          <p className="subtitle">
            Search, filter, and compare champion
            statistics from your SQL Server dataset.
          </p>
        </div>

        <span className="patch-badge">PATCH 26.20</span>
      </header>

      <section className="dashboard-panel">
        <div className="explorer-header">
          <div>
            <h2>Champion Database</h2>
            <p>
              Browse imported champions and open
              detailed statistics.
            </p>
          </div>

          <span className="results-count">
            {filteredChampions.length} / {champions.length}
            {" "}Champions
          </span>
        </div>

        <div className="explorer-controls">

          <label className="explorer-field">
            <span>
              <Search size={15} />
              Search
            </span>

            <input
              type="search"
              placeholder="Search champion name..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
            />
          </label>

          <label className="explorer-field">
            <span>
              <Filter size={15} />
              Role
            </span>

            <select
              value={selectedRole}
              onChange={(event) => {
                setSelectedRole(event.target.value);
                resetPage();
              }}
            >
              <option value="all">All Roles</option>

              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="explorer-field">
            <span>
              <ArrowUpDown size={15} />
              Sort By
            </span>

            <select
              value={sortBy}
              onChange={(event) => {
                const value = event.target.value;

                setSortBy(value);

                setSortDirection(
                  value === "name" ? "asc" : "desc"
                );

                resetPage();
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="explorer-sort-button"
            onClick={() => {
              setSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc"
              );

              resetPage();
            }}
          >
            <ArrowUpDown size={17} />

            {sortDirection === "asc"
              ? "Ascending"
              : "Descending"}
          </button>
        </div>

        {loading && (
          <p role="status">Loading champions...</p>
        )}

        {error && (
          <ErrorState
            message={error}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        )}

        {!loading && !error && (
          <>
            <div className="champion-collection-grid">
              {visibleChampions.map((champion) => (
                <Link
                  key={champion.championId}
                  to={`/champions/${champion.championId}`}
                  className="champion-collection-card"
                >
                  <div className="champion-portrait-container">
                    <ChampionImage
                      championId={champion.championId}
                      name={champion.championName}
                      className="champion-portrait"
                    />
                  </div>

                  <div className="champion-collection-info">
                    <h3>{champion.championName}</h3>

                    <p>{champion.roles || "Unclassified"}</p>

                    <div className="champion-card-stats">
                      <span>
                        HP {champion.healthBase ?? "—"}
                      </span>

                      <span>
                        ARM {champion.armorBase ?? "—"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredChampions.length === 0 && (
              <div className="explorer-empty">
                No champions match your search or filters.
              </div>
            )}

            {filteredChampions.length > 0 && (
              <div className="explorer-pagination">
                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage(currentPage - 1)
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPage(currentPage + 1)
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default Champions;