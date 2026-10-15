import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { championApi } from "../../services/api";

const STAT_OPTIONS = [
  // Health
  { value: "healthBase", label: "Base Health" },
  { value: "healthGrowth", label: "Health Growth" },
  { value: "healthRegenBase", label: "Base Health Regen" },
  { value: "healthRegenGrowth", label: "Health Regen Growth" },

  // Mana
  { value: "manaBase", label: "Base Mana" },
  { value: "manaGrowth", label: "Mana Growth" },
  { value: "manaRegenBase", label: "Base Mana Regen" },
  { value: "manaRegenGrowth", label: "Mana Regen Growth" },

  // Attack
  { value: "attackDamageBase", label: "Base Attack Damage" },
  { value: "attackDamageGrowth", label: "Attack Damage Growth" },
  { value: "attackSpeedBase", label: "Base Attack Speed" },
  { value: "attackSpeedGrowth", label: "Attack Speed Growth" },
  { value: "attackRange", label: "Attack Range" },

  // Defense
  { value: "armorBase", label: "Base Armor" },
  { value: "armorGrowth", label: "Armor Growth" },
  { value: "magicResistBase", label: "Base Magic Resistance" },
  { value: "magicResistGrowth", label: "Magic Resistance Growth" },

  // Other
  { value: "movementSpeed", label: "Movement Speed" },
  { value: "criticalStrikeBase", label: "Base Critical Strike" },
  { value: "criticalStrikeGrowth", label: "Critical Strike Growth" },
];

const LIMIT_OPTIONS = [5, 10, 15, 20];

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 3,
  });
}

function ChampionRankingChart() {
  const [champions, setChampions] = useState([]);

  const [selectedStat, setSelectedStat] =
    useState("healthBase");

  const [sortOrder, setSortOrder] =
    useState("desc");

  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load champions only when component mounts
  // or the user retries a failed request.
  useEffect(() => {
    let cancelled = false;

    async function loadChampions() {
      setLoading(true);
      setError(null);

      try {
        const data = await championApi.getAll();

        if (!Array.isArray(data)) {
          throw new Error(
            "The champion API returned an invalid response."
          );
        }

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

  const currentStat = STAT_OPTIONS.find(
    (option) => option.value === selectedStat
  );

  const validChampions = useMemo(() => {
    return champions
      .filter((champion) => {
        const value = champion[selectedStat];

        return (
          typeof value === "number" &&
          Number.isFinite(value)
        );
      })
      .map((champion) => ({
        id: champion.championId,
        name: champion.championName,
        value: champion[selectedStat],
      }));
  }, [champions, selectedStat]);

  const rankedChampions = useMemo(() => {
    const sorted = [...validChampions].sort((a, b) => {
      const difference =
        sortOrder === "desc"
          ? b.value - a.value
          : a.value - b.value;

      return (
        difference ||
        a.name.localeCompare(b.name)
      );
    });

    return sorted.slice(0, limit);
  }, [validChampions, sortOrder, limit]);

  // Reversing for vertical bar layouts makes rank #1
  // appear at the top of the chart.
  const chartData = useMemo(
    () => [...rankedChampions].reverse(),
    [rankedChampions]
  );

  return (
    <section className="dashboard-panel">
      <div className="chart-header">
        <div>
          <h2>Champion Rankings</h2>

          <p>
            Compare recorded champion statistics
            across the current dataset.
          </p>
        </div>

        <div className="chart-controls">
          <label>
            Statistic
            <select
              value={selectedStat}
              onChange={(event) =>
                setSelectedStat(event.target.value)
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
            Sort Order
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value)
              }
            >
              <option value="desc">
                Highest First
              </option>

              <option value="asc">
                Lowest First
              </option>
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
          Loading champion rankings...
        </p>
      )}

      {error && (
        <div className="ranking-error" role="alert">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              setRetryCount((count) => count + 1)
            }
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="ranking-summary">
            <span>
              <strong>{rankedChampions.length}</strong>{" "}
              champions displayed
            </span>

            <span>
              <strong>{validChampions.length}</strong>{" "}
              champions with recorded values
            </span>

            <span>
              {sortOrder === "desc"
                ? "Descending"
                : "Ascending"}
            </span>
          </div>

          <h3 className="ranking-chart-title">
            {currentStat.label} —{" "}
            {sortOrder === "desc"
              ? "Highest to Lowest"
              : "Lowest to Highest"}
          </h3>

          {rankedChampions.length === 0 ? (
            <p>
              No recorded statistics are available
              for this selection.
            </p>
          ) : (
            <>
              <div
                className="ranking-chart-container"
                role="region"
                aria-label={
                  `${currentStat.label} champion rankings`
                }
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    accessibilityLayer
                    layout="vertical"
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 35,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      stroke="#29364a"
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      stroke="#9baebc"
                      tick={{ fontSize: 11 }}
                      domain={[
                        (dataMin) =>
                          Math.min(0, dataMin),
                        (dataMax) =>
                          Math.max(0, dataMax),
                      ]}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      stroke="#9baebc"
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatNumber(value),
                        currentStat.label,
                      ]}
                      contentStyle={{
                        backgroundColor: "#101c2b",
                        border:
                          "1px solid #c9aa71",
                        borderRadius: "4px",
                        color: "#f0e6d2",
                      }}
                    />

                    <Bar
                      dataKey="value"
                      name={currentStat.label}
                      fill="#c9aa71"
                      maxBarSize={27}
                      radius={[0, 4, 4, 0]}
                    >
                      {chartData.map((champion) => (
                        <Cell
                          key={champion.id}
                          fill="#c9aa71"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Champion</th>
                      <th>{currentStat.label}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rankedChampions.map(
                      (champion, index) => (
                        <tr key={champion.id}>
                          <td>{index + 1}</td>

                          <td>
                            <Link
                              className="ranking-champion-link"
                              to={`/champions/${champion.id}`}
                            >
                              {champion.name}
                            </Link>
                          </td>

                          <td>
                            {formatNumber(
                              champion.value
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="chart-note">
            Rankings use recorded dataset values.
            Missing statistics are excluded, but
            recorded zero values are retained.
            Growth coefficients are not the same
            as a constant stat increase per level.
          </p>
        </>
      )}
    </section>
  );
}

export default ChampionRankingChart;