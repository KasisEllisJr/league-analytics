import { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import { championApi } from "../../services/api";

const STAT_OPTIONS = [
  { value: "healthBase", label: "Base Health" },
  { value: "healthGrowth", label: "Health Growth" },
  { value: "healthRegenBase", label: "Base Health Regen" },
  { value: "manaBase", label: "Base Mana" },
  { value: "manaGrowth", label: "Mana Growth" },
  { value: "attackDamageBase", label: "Base Attack Damage" },
  { value: "attackDamageGrowth", label: "Attack Damage Growth" },
  { value: "attackSpeedBase", label: "Base Attack Speed" },
  { value: "armorBase", label: "Base Armor" },
  { value: "armorGrowth", label: "Armor Growth" },
  { value: "magicResistBase", label: "Base Magic Resistance" },
  { value: "magicResistGrowth", label: "Magic Resist Growth" },
  { value: "movementSpeed", label: "Movement Speed" },
  { value: "attackRange", label: "Attack Range" },
];

function getRoles(champion) {
  if (!champion.roles) return [];

  return champion.roles
    .split(/[|,]/)
    .map((role) => role.trim())
    .filter(Boolean);
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function getAxisScale(values) {
  const maximum = Math.max(0, ...values);

  if (maximum === 0) {
    return {
      max: 1,
      ticks: [0, 0.25, 0.5, 0.75, 1],
    };
  }

  const rawStep = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));

  const normalized = rawStep / magnitude;

  const niceStep =
    normalized <= 1 ? 1 :
    normalized <= 2 ? 2 :
    normalized <= 2.5 ? 2.5 :
    normalized <= 5 ? 5 : 10;

  const step = niceStep * magnitude;

  const round = (number) =>
    Number(number.toPrecision(12));

  return {
    max: round(step * 5),
    ticks: Array.from(
      { length: 6 },
      (_, index) => round(index * step)
    ),
  };
}

function RoleAverageChart() {
  const [champions, setChampions] = useState([]);
  const [stat, setStat] = useState("healthBase");
  const [sortBy, setSortBy] = useState("average");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChampions() {
      try {
        const data = await championApi.getAll();

        if (!Array.isArray(data)) {
          throw new Error("Invalid champion data returned.");
        }

        if (!cancelled) setChampions(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChampions();

    return () => {
      cancelled = true;
    };
  }, []);

  const roleData = useMemo(() => {
    const groups = new Map();

    champions.forEach((champion) => {
      const value = champion[stat];

      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        return;
      }

      new Set(getRoles(champion)).forEach((role) => {
        if (!groups.has(role)) {
          groups.set(role, {
            role,
            sum: 0,
            count: 0,
          });
        }

        const group = groups.get(role);
        group.sum += value;
        group.count++;
      });
    });

    const result = [...groups.values()].map((group) => ({
      role: group.role,
      average: group.sum / group.count,
      count: group.count,
    }));

    result.sort((a, b) =>
      sortBy === "average"
        ? b.average - a.average ||
          a.role.localeCompare(b.role)
        : a.role.localeCompare(b.role)
    );

    return result;
  }, [champions, stat, sortBy]);

  const axis = useMemo(
    () => getAxisScale(roleData.map((row) => row.average)),
    [roleData]
  );

  const selectedStat = STAT_OPTIONS.find(
    (option) => option.value === stat
  );

  return (
    <section className="dashboard-panel advanced-panel">
      <div className="chart-header">
        <div>
          <p className="analytics-eyebrow">
            CHAMPION ANALYTICS
          </p>

          <h2>Champion Role Averages</h2>

          <p>
            Compare average recorded statistics
            across champion roles.
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
            Sort Order
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="average">
                Highest Average
              </option>
              <option value="role">
                Role Name
              </option>
            </select>
          </label>
        </div>
      </div>

      {loading && (
        <p role="status">
          Loading champion role statistics...
        </p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && roleData.length === 0 && (
        <p>No role statistics are available.</p>
      )}

      {!loading && !error && roleData.length > 0 && (
        <>
          <div className="analytics-scale-summary">
            <span>
              <strong>{selectedStat.label}</strong>
            </span>

            <span>
              Chart Scale: 0 – {formatNumber(axis.max)}
            </span>

            <span>
              {roleData.length} Role Groups
            </span>
          </div>

          <div
            className="role-average-chart"
            role="region"
            aria-label={
              `Average ${selectedStat.label} by champion role`
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                data={roleData}
                margin={{
                  top: 36,
                  right: 16,
                  left: 8,
                  bottom: 8,
                }}
              >
                <CartesianGrid
                  stroke="#3b4e5c"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="role"
                  stroke="#b4c3c8"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: "#92764a" }}
                  tickLine={false}
                  interval={0}
                />

                <YAxis
                  stroke="#c9aa71"
                  tick={{ fontSize: 12 }}
                  domain={[0, axis.max]}
                  ticks={axis.ticks}
                  width={64}
                  allowDecimals
                  tickFormatter={formatNumber}
                  axisLine={{ stroke: "#92764a" }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    selectedStat.label,
                  ]}
                  labelFormatter={(label) =>
                    `${label} Role`
                  }
                  contentStyle={{
                    backgroundColor: "#101c2b",
                    border: "1px solid #c9aa71",
                    borderRadius: 4,
                    color: "#f0e6d2",
                  }}
                />

                <Bar
                  dataKey="average"
                  name={selectedStat.label}
                  fill="#0ac8b9"
                  maxBarSize={74}
                  radius={[5, 5, 0, 0]}
                >
                  <LabelList
                    dataKey="average"
                    position="top"
                    formatter={formatNumber}
                    fill="#e6c78b"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Average {selectedStat.label}</th>
                  <th>Sample Size</th>
                </tr>
              </thead>

              <tbody>
                {roleData.map((row) => (
                  <tr key={row.role}>
                    <td>{row.role}</td>

                    <td>
                      {formatNumber(row.average)}
                    </td>

                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="chart-note">
            The axis starts at zero and automatically
            adjusts to the selected statistic.
            Role groups may overlap because champions
            can have multiple roles. Missing values
            are excluded from each average.
          </p>
        </>
      )}
    </section>
  );
}

export default RoleAverageChart;