import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  GitCompareArrows,
} from "lucide-react";

import {
  itemApi,
  analyticsApi,
} from "../services/api";

import ItemComparisonChart
  from "../components/charts/ItemComparisonChart";

const STAT_FIELDS = [
  ["Attack Damage", "attackDamage"],
  ["Ability Power", "abilityPower"],
  ["Health", "health"],
  ["Mana", "mana"],
  ["Armor", "armor"],
  ["Magic Resistance", "magicResist"],
  ["Attack Speed", "attackSpeed"],
  ["Critical Strike", "criticalStrike"],
  ["Movement Speed", "movementSpeed"],
  ["Ability Haste", "abilityHaste"],
];

function formatValue(value) {
  return value == null
    ? "—"
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
}

function ItemComparison() {
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");

  const [comparison, setComparison] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingComparison, setLoadingComparison] =
    useState(false);

  const [error, setError] = useState(null);

  // Populate the item selectors
  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const data = await itemApi.getAll();

        if (cancelled) return;

        const sorted = [...data].sort((a, b) =>
          a.itemName.localeCompare(b.itemName)
        );

        setItems(sorted);

        const requestedFirst = searchParams.get("first");

        const defaultFirst =
          sorted.find(
            (item) =>
              String(item.itemId) === requestedFirst
          ) ??
          sorted.find((item) => item.itemId === 3078) ??
          sorted[0];

        if (!defaultFirst) return;

        const defaultSecond =
          sorted.find(
            (item) =>
              item.itemId === 3031 &&
              item.itemId !== defaultFirst.itemId
          ) ??
          sorted.find(
            (item) =>
              item.itemId !== defaultFirst.itemId
          );

        setFirstId(String(defaultFirst.itemId));

        if (defaultSecond) {
          setSecondId(String(defaultSecond.itemId));
        }

      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Fetch comparison from the Java backend
  useEffect(() => {
    if (!firstId || !secondId || firstId === secondId) {
      setComparison(null);
      return;
    }

    let cancelled = false;

    async function loadComparison() {
      setLoadingComparison(true);
      setComparison(null);
      setError(null);

      try {
        const data = await analyticsApi.compareItems(
          Number(firstId),
          Number(secondId)
        );

        if (!cancelled) {
          setComparison(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingComparison(false);
        }
      }
    }

    loadComparison();

    return () => {
      cancelled = true;
    };
  }, [firstId, secondId]);

  const firstItem = comparison?.firstItem;
  const secondItem = comparison?.secondItem;

  const comparableStats = firstItem && secondItem
    ? STAT_FIELDS.filter(
        ([, key]) =>
          firstItem[key] != null ||
          secondItem[key] != null
      )
    : [];

  return (
    <>
      <Link to="/items" className="back-link">
        <ArrowLeft size={17} />
        Back to Item Explorer
      </Link>

      <header className="page-header">
        <div>
          <p className="eyebrow">
            ANALYTICS / ITEM COMPARISON
          </p>

          <h1>Compare Items</h1>

          <p className="subtitle">
            Compare item attributes and gold costs
            using your SQL Server dataset.
          </p>
        </div>

        <span className="patch-badge">
          PATCH 26.20
        </span>
      </header>

      <section className="dashboard-panel">
        <div className="item-section-title">
          <GitCompareArrows size={22} />
          <h2>Select Items</h2>
        </div>

        {loadingItems && (
          <p role="status">Loading item selectors...</p>
        )}

        {!loadingItems && (
          <div className="comparison-selectors">
            <label className="explorer-field">
              <span>First Item</span>

              <select
                value={firstId}
                onChange={(event) =>
                  setFirstId(event.target.value)
                }
              >
                {items.map((item) => (
                  <option
                    key={item.itemId}
                    value={item.itemId}
                    disabled={
                      String(item.itemId) === secondId
                    }
                  >
                    {item.itemName} (#{item.itemId})
                  </option>
                ))}
              </select>
            </label>

            <label className="explorer-field">
              <span>Second Item</span>

              <select
                value={secondId}
                onChange={(event) =>
                  setSecondId(event.target.value)
                }
              >
                {items.map((item) => (
                  <option
                    key={item.itemId}
                    value={item.itemId}
                    disabled={
                      String(item.itemId) === firstId
                    }
                  >
                    {item.itemName} (#{item.itemId})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {firstId === secondId && firstId !== "" && (
          <p className="error-message">
            Please select two different items.
          </p>
        )}

        {error && (
          <p className="error-message" role="alert">
            Unable to load comparison: {error}
          </p>
        )}

        {loadingComparison && (
          <p role="status">
            Calculating item comparison...
          </p>
        )}
      </section>

      {!loadingComparison && comparison && (
        <>
          <section className="item-summary-grid">
            <article className="stat-card">
              <p className="stat-label">FIRST ITEM</p>

              <h2 className="comparison-item-name">
                {firstItem.itemName}
              </h2>

              <p className="stat-description">
                {formatValue(firstItem.goldCost)} Gold
              </p>

              <Link
                className="details-link"
                to={`/items/${firstItem.itemId}`}
              >
                View Item
              </Link>
            </article>

            <article className="stat-card">
              <p className="stat-label">SECOND ITEM</p>

              <h2 className="comparison-item-name">
                {secondItem.itemName}
              </h2>

              <p className="stat-description">
                {formatValue(secondItem.goldCost)} Gold
              </p>

              <Link
                className="details-link"
                to={`/items/${secondItem.itemId}`}
              >
                View Item
              </Link>
            </article>
          </section>

          <section className="dashboard-panel">
            <h2>Gold Cost Comparison</h2>

            <p>
                {comparison.goldCostDifference === 0
                    ? `${firstItem.itemName} and ${secondItem.itemName} have the same recorded gold cost.`
                    : `${firstItem.itemName} costs ${formatValue(
                        Math.abs(comparison.goldCostDifference)
                    )} gold ${
                        comparison.goldCostDifference > 0
                        ? "more"
                        : "less"
                    } than ${secondItem.itemName}.`}
            </p>
          </section>

          <section className="dashboard-panel">
            <h2>Item Statistics Comparison</h2>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Statistic</th>
                    <th>{firstItem.itemName}</th>
                    <th>{secondItem.itemName}</th>
                  </tr>
                </thead>

                <tbody>
                  {comparableStats.map(([label, key]) => (
                    <tr key={key}>
                      <td>{label}</td>
                      <td>{formatValue(firstItem[key])}</td>
                      <td>{formatValue(secondItem[key])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {comparableStats.length === 0 && (
              <p>
                No structured statistics are available
                for these items.
              </p>
            )}
          </section>

          <section className="dashboard-panel">
            <h2>Visual Comparison</h2>

            <p className="chart-note">
              Each statistic uses its original units.
              Compare bars within the same statistic,
              not across different statistics.
              Missing values are not treated as zero.
            </p>

            <ItemComparisonChart
              firstItem={firstItem}
              secondItem={secondItem}
            />
          </section>
        </>
      )}
    </>
  );
}

export default ItemComparison;