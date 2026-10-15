import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { championApi, analyticsApi } from "../../services/api";

const STAT_OPTIONS = [
  { value: "health", label: "Health" },
  { value: "attackDamage", label: "Attack Damage" },
  { value: "armor", label: "Armor" },
  { value: "magicResist", label: "Magic Resist" },
  { value: "resourcePoints", label: "Resource Points" },
];

function ChampionLevelChart() {
  const [champions, setChampions] = useState([]);
  const [selectedChampion, setSelectedChampion] = useState("");
  const [selectedStat, setSelectedStat] = useState("health");

  const [levelData, setLevelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [championsLoading, setChampionsLoading] =
    useState(true);
  const [error, setError] = useState(null);

  // Load the champion list for the dropdown
  useEffect(() => {
    let cancelled = false;

    async function loadChampions() {
      try {
        const data = await championApi.getAll();

        if (!cancelled) {
          setChampions(data);

          if (data.length > 0) {
            const ahri = data.find(
              (champion) => champion.championId === 103
            );

            setSelectedChampion(
              String(
                ahri?.championId ?? data[0].championId
              )
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setChampionsLoading(false);
        }
      }
    }

    loadChampions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Retrieve calculated stats for levels 1 through 18
  useEffect(() => {
    if (!selectedChampion) {
      return;
    }

    let cancelled = false;

    async function loadLevelData() {
      setLoading(true);
      setError(null);
      setLevelData([]);

      try {
        const levels = Array.from(
          { length: 20 },
          (_, index) => index + 1
        );

        const results = await Promise.all(
          levels.map((level) =>
            analyticsApi.getChampionAtLevel(
              Number(selectedChampion),
              level
            )
          )
        );

        if (!cancelled) {
          setLevelData(
            results.sort((a, b) => a.level - b.level)
          );
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

    loadLevelData();

    return () => {
      cancelled = true;
    };
  }, [selectedChampion]);

  const currentChampion = champions.find(
    (champion) =>
      String(champion.championId) === selectedChampion
  );

  const currentStatOption = STAT_OPTIONS.find(
    (option) => option.value === selectedStat
  );

  const chartData = levelData
    .map((entry) => ({
      level: entry.level,
      value: entry[selectedStat],
    }))
    .filter(
      (entry) =>
        typeof entry.value === "number" &&
        Number.isFinite(entry.value)
    );

  return (
    <section className="dashboard-panel analytics-chart-panel">
      <div className="chart-header">
        <div>
          <h2>Champion Level Progression</h2>

          <p>
            Explore estimated champion statistics
            between levels 1 and 20.
          </p>
        </div>

        <div className="chart-controls">
          <label>
            Champion
            <select
              value={selectedChampion}
              onChange={(event) =>
                setSelectedChampion(event.target.value)
              }
              disabled={championsLoading}
            >
              {champions.length === 0 && (
                <option value="">No champions loaded</option>
              )}

              {champions.map((champion) => (
                <option
                  key={champion.championId}
                  value={String(champion.championId)}
                >
                  {champion.championName}
                </option>
              ))}
            </select>
          </label>

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
        </div>
      </div>

      {loading && (
        <p role="status">Calculating champion statistics...</p>
      )}

      {error && (
        <p className="error-message" role="alert">
          Failed to load champion statistics: {error}
        </p>
      )}

      {!loading && !error && chartData.length === 0 && (
        <p>No level statistics are available.</p>
      )}

      {!loading && !error && chartData.length > 0 && (
        <>
          <div className="chart-summary">
            <span>
              Champion:{" "}
              <strong>
                {currentChampion?.championName ?? "Unknown"}
              </strong>
            </span>

            <span>
              Level 1:{" "}
              <strong>{chartData[0].value}</strong>
            </span>

            <span>
              Level {chartData.at(-1).level}:{" "}
              <strong>{chartData.at(-1).value}</strong>
            </span>
          </div>

          <div className="chart-wrapper line-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 15,
                  right: 25,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  stroke="#29364a"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="level"
                  type="number"
                  domain={[1, 20]}
                  ticks={[1, 3, 6, 9, 12, 15, 18, 20]}
                  stroke="#9ca3af"
                  label={{
                    value: "Champion Level",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#9ca3af",
                  }}
                />

                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  width={65}
                  domain={["auto", "auto"]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111a28",
                    border: "1px solid #304057",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  labelFormatter={(level) =>
                    `Level ${level}`
                  }
                  formatter={(value) => [
                    value,
                    currentStatOption?.label ?? "Stat",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00d4aa"
                  strokeWidth={3}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="chart-note">
            Values use the standard champion growth formula.
            Item bonuses, runes, and conditional champion
            effects are not included.
          </p>
        </>
      )}
    </section>
  );
}

export default ChampionLevelChart;