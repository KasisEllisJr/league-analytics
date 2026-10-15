import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
} from "lucide-react";

import { itemApi } from "../services/api";
import ItemImage from "../components/ItemImage";

const PAGE_SIZE = 20;

const STAT_FILTERS = [
  { value: "all", label: "All Items" },
  { value: "attackDamage", label: "Attack Damage" },
  { value: "abilityPower", label: "Ability Power" },
  { value: "health", label: "Health" },
  { value: "armor", label: "Armor" },
  { value: "magicResist", label: "Magic Resist" },
  { value: "attackSpeed", label: "Attack Speed" },
  { value: "abilityHaste", label: "Ability Haste" },
];

const SORT_OPTIONS = [
  { value: "itemName", label: "Item Name" },
  { value: "goldCost", label: "Gold Cost" },
  { value: "attackDamage", label: "Attack Damage" },
  { value: "abilityPower", label: "Ability Power" },
  { value: "health", label: "Health" },
  { value: "armor", label: "Armor" },
  { value: "abilityHaste", label: "Ability Haste" },
];

function formatValue(value) {
  return value == null ? "—" : value;
}

function Items() {
  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");
  const [statFilter, setStatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("itemName");
  const [direction, setDirection] = useState("asc");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const data = await itemApi.getAll();

        if (!cancelled) {
          setItems(data);
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

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = items.filter((item) => {
      const matchesName = item.itemName
        .toLowerCase()
        .includes(query);

      const matchesStat =
        statFilter === "all" ||
        (
          typeof item[statFilter] === "number" &&
          item[statFilter] > 0
        );

      return matchesName && matchesStat;
    });

    result.sort((a, b) => {
      const first = a[sortBy];
      const second = b[sortBy];

      // Null values always appear last
      if (first == null && second == null) return 0;
      if (first == null) return 1;
      if (second == null) return -1;

      const comparison =
        sortBy === "itemName"
          ? first.localeCompare(second)
          : first - second;

      return direction === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [items, search, statFilter, sortBy, direction]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleItems = filteredItems.slice(
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
          <p className="eyebrow">DATABASE / ITEMS</p>
          <h1>Item Explorer</h1>
          <p className="subtitle">
            Search, filter, and analyze item statistics.
          </p>
        </div>

        <Link
          className="compare-link-button"
          to="/items/compare"
        >
          <GitCompareArrows size={18} />
          Compare Items
        </Link>
      </header>

      <section className="dashboard-panel">
        <div className="explorer-header">
          <div>
            <h2>Item Database</h2>
            <p>
              Browse the imported patch 26.20 item dataset.
            </p>
          </div>

          <span className="results-count">
            {filteredItems.length} / {items.length} Items
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
              placeholder="Search item name..."
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
              Stat Filter
            </span>

            <select
              value={statFilter}
              onChange={(event) => {
                setStatFilter(event.target.value);
                resetPage();
              }}
            >
              {STAT_FILTERS.map((filter) => (
                <option
                  key={filter.value}
                  value={filter.value}
                >
                  {filter.label}
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
                setDirection(
                  value === "itemName" ? "asc" : "desc"
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
              setDirection((current) =>
                current === "asc" ? "desc" : "asc"
              );
              resetPage();
            }}
          >
            <ArrowUpDown size={17} />
            {direction === "asc"
              ? "Ascending"
              : "Descending"}
          </button>
        </div>

        {loading && (
          <p role="status">Loading items...</p>
        )}

        {error && (
          <p className="error-message" role="alert">
            Failed to retrieve items: {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="item-collection-grid">
              {visibleItems.map((item) => (
                <Link
                  key={item.itemId}
                  to={`/items/${item.itemId}`}
                  className="item-collection-card"
                >
                  <div className="item-icon-frame">
                    <ItemImage
                      itemId={item.itemId}
                      name={item.itemName}
                      className="item-collection-icon"
                    />
                  </div>

                  <div className="item-collection-details">
                    <h3>{item.itemName}</h3>

                    <span className="item-gold-cost">
                      {item.goldCost ?? "—"} Gold
                    </span>

                    <p>
                      {item.attackDamage != null
                        ? `+${item.attackDamage} Attack Damage`
                        : item.abilityPower != null
                          ? `+${item.abilityPower} Ability Power`
                          : item.health != null
                            ? `+${item.health} Health`
                            : "View Item Details"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="explorer-empty">
                No items match your search or filters.
              </div>
            )}

            {filteredItems.length > 0 && (
              <div className="explorer-pagination">
                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
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

export default Items;