import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Coins,
  Trophy,
} from "lucide-react";

import { itemApi } from "../../services/api";
import ItemImage from "../ItemImage";

import {
  calculateStatPer1000Gold,
} from "../../utils/analytics";

const STAT_OPTIONS = [
  { value: "attackDamage", label: "Attack Damage" },
  { value: "abilityPower", label: "Ability Power" },
  { value: "health", label: "Health" },
  { value: "mana", label: "Mana" },
  { value: "armor", label: "Armor" },
  { value: "magicResist", label: "Magic Resist" },
  { value: "attackSpeed", label: "Attack Speed" },
  { value: "criticalStrike", label: "Critical Strike" },
  { value: "abilityHaste", label: "Ability Haste" },
];

const LIMIT_OPTIONS = [5, 10, 20];

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function ItemValueChart() {
  const [items, setItems] = useState([]);

  const [stat, setStat] = useState("attackDamage");
  const [limit, setLimit] = useState(10);
  const [minimumGold, setMinimumGold] = useState(1000);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const data = await itemApi.getAll();

        if (!Array.isArray(data)) {
          throw new Error("Invalid item data returned.");
        }

        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedStat = STAT_OPTIONS.find(
    (option) => option.value === stat
  );

  const eligibleItems = useMemo(() => {
    return items
      .filter((item) => {
        const statValue = item[stat];
        const cost = item.goldCost;

        return (
          typeof statValue === "number" &&
          Number.isFinite(statValue) &&
          statValue > 0 &&
          typeof cost === "number" &&
          Number.isFinite(cost) &&
          cost >= minimumGold &&
          cost > 0
        );
      })
      .map((item) => ({
        id: item.itemId,
        name: item.itemName,
        goldCost: item.goldCost,
        rawStat: item[stat],
        value: calculateStatPer1000Gold(
          item[stat],
          item.goldCost
        ),
      }))
      .filter((item) => item.value != null)
      .sort(
        (a, b) =>
          b.value - a.value ||
          a.name.localeCompare(b.name)
      );
  }, [items, stat, minimumGold]);

  const ranking = useMemo(
    () => eligibleItems.slice(0, limit),
    [eligibleItems, limit]
  );

  const maxValue = Math.max(
    0,
    ...ranking.map((item) => item.value)
  );

  return (
    <section className="dashboard-panel advanced-panel">
      <div className="chart-header">
        <div>
          <p className="analytics-eyebrow">
            ITEM ANALYTICS
          </p>

          <h2>Item Stat per 1,000 Gold</h2>

          <p>
            Rank equipment by a selected recorded
            statistic relative to purchase cost.
          </p>
        </div>

        <div className="chart-controls">
          <label>
            Statistic
            <select
              value={stat}
              onChange={(event) =>
                setStat(event.target.value)
              }
            >
              {STAT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Minimum Cost
            <select
              value={minimumGold}
              onChange={(event) =>
                setMinimumGold(Number(event.target.value))
              }
            >
              <option value={1}>
                Any Positive Cost
              </option>

              <option value={500}>500 Gold</option>
              <option value={1000}>1,000 Gold</option>
              <option value={2000}>2,000 Gold</option>
              <option value={3000}>3,000 Gold</option>
            </select>
          </label>

          <label>
            Results
            <select
              value={limit}
              onChange={(event) =>
                setLimit(Number(event.target.value))
              }
            >
              {LIMIT_OPTIONS.map((number) => (
                <option key={number} value={number}>
                  Top {number}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading && (
        <p role="status">
          Loading item rankings...
        </p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="item-ranking-summary">
            <div>
              <span className="ranking-summary-label">
                SELECTED STATISTIC
              </span>

              <strong>{selectedStat.label}</strong>
            </div>

            <div>
              <span className="ranking-summary-label">
                ELIGIBLE ITEMS
              </span>

              <strong>{eligibleItems.length}</strong>
            </div>

            <div>
              <span className="ranking-summary-label">
                HIGHEST RATIO
              </span>

              <strong>
                {ranking.length > 0
                  ? formatNumber(ranking[0].value)
                  : "—"}
              </strong>
            </div>
          </div>

          {ranking.length === 0 ? (
            <div className="item-ranking-empty">
              No items have a valid recorded statistic
              and gold cost for these filters.
            </div>
          ) : (
            <>
              <div className="item-ranking-scale">
                <span>0</span>
                <span>
                  {formatNumber(maxValue / 2)}
                </span>
                <span>
                  {formatNumber(maxValue)}
                </span>
              </div>

              <div
                className="item-value-list"
                aria-label={
                  `${selectedStat.label} per 1,000 gold rankings`
                }
              >
                {ranking.map((item, index) => {
                  const percentage =
                    maxValue > 0
                      ? (item.value / maxValue) * 100
                      : 0;

                  return (
                    <article
                      className={
                        `item-value-row ${
                          index === 0
                            ? "item-value-row-leading"
                            : ""
                        }`
                      }
                      key={item.id}
                    >
                      <div className="item-value-identity">
                        <span className="item-rank-number">
                          {index === 0 ? (
                            <Trophy
                              size={21}
                              aria-label="Highest ranked"
                            />
                          ) : (
                            `#${index + 1}`
                          )}
                        </span>

                        <Link
                          to={`/items/${item.id}`}
                          className="item-value-image-link"
                        >
                          <ItemImage
                            itemId={item.id}
                            name={item.name}
                            className="item-value-icon"
                          />
                        </Link>

                        <div className="item-value-info">
                          <Link
                            to={`/items/${item.id}`}
                            className="item-value-name"
                          >
                            {item.name}
                            <ArrowUpRight
                              size={14}
                              aria-hidden="true"
                            />
                          </Link>

                          <span className="item-value-meta">
                            <Coins
                              size={13}
                              aria-hidden="true"
                            />
                            {formatNumber(item.goldCost)} Gold
                            <span aria-hidden="true">·</span>
                            {formatNumber(item.rawStat)}{" "}
                            {selectedStat.label}
                          </span>
                        </div>
                      </div>

                      <div className="item-value-bar-area">
                        <div className="item-value-bar-track">
                          <div
                            className="item-value-bar-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <div className="item-value-amount">
                          <strong>
                            {formatNumber(item.value)}
                          </strong>

                          <span>
                            / 1,000 Gold
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <p className="chart-note">
            The bar scale is relative to the highest
            displayed value for the selected statistic,
            starting at zero. Only one statistic is
            compared at a time. Passive effects,
            active abilities, and situational effects
            are not included. A higher ratio does not
            necessarily mean an item is stronger.
          </p>
        </>
      )}
    </section>
  );
}

export default ItemValueChart;