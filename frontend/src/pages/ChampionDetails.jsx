import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Activity,
  Shield,
  Swords,
} from "lucide-react";

import {
  championApi,
  analyticsApi,
} from "../services/api";

import ChampionStatCard from "../components/ChampionStatCard";
import ChampionImage from "../components/ChampionImage";

function ChampionDetails() {
  const { id } = useParams();

  const [champion, setChampion] = useState(null);
  const [calculatedStats, setCalculatedStats] =
    useState(null);

  const [level, setLevel] = useState(1);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  // Retrieve champion details
  useEffect(() => {
    let cancelled = false;

    async function loadChampion() {
      setLoading(true);
      setError(null);
      setChampion(null);
      setCalculatedStats(null);
      setLevel(1);

      try {
        const data = await championApi.getById(id);

        if (!cancelled) {
          setChampion(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.status === 404
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChampion();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Retrieve calculated statistics for the selected level
  useEffect(() => {
    if (!champion || String(champion.championId) !== id) {
      return;
    }

    let cancelled = false;

    async function loadCalculatedStats() {
      setStatsLoading(true);
      setStatsError(null);
      setCalculatedStats(null);

      try {
        const data =
          await analyticsApi.getChampionAtLevel(
            champion.championId,
            level
          );

        if (!cancelled) {
          setCalculatedStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setStatsError(err.message);
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    }

    loadCalculatedStats();

    return () => {
      cancelled = true;
    };
  }, [champion, id, level]);

  if (loading) {
    return <p role="status">Loading champion details...</p>;
  }

  if (error) {
    return (
      <section className="dashboard-panel">
        <p className="error-message" role="alert">
          {error}
        </p>

        <Link to="/champions" className="back-link">
          <ArrowLeft size={16} />
          Back to Champions
        </Link>
        <div className="champion-splash-hero">
          <ChampionImage
            championId={champion.championId}
            name={champion.championName}
            variant="splash"
            className="champion-splash-image"
          />

          <div className="champion-splash-overlay">
            <span>CHAMPION ARCHIVE</span>
            <h2>{champion.championName}</h2>
            <p>{champion.roles || "Unclassified"}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!champion) {
    return null;
  }

  const stats = calculatedStats;

  const statCards = [
    {
      label: "Health",
      icon: Activity,
      base: champion.healthBase,
      growth: champion.healthGrowth,
      calculated: stats?.health,
    },
    {
      label: "Attack Damage",
      icon: Swords,
      base: champion.attackDamageBase,
      growth: champion.attackDamageGrowth,
      calculated: stats?.attackDamage,
    },
    {
      label: "Armor",
      icon: Shield,
      base: champion.armorBase,
      growth: champion.armorGrowth,
      calculated: stats?.armor,
    },
    {
      label: "Magic Resistance",
      icon: Shield,
      base: champion.magicResistBase,
      growth: champion.magicResistGrowth,
      calculated: stats?.magicResist,
    },
    {
      label: champion.resourceType || "Resource",
      icon: Activity,
      base: champion.manaBase,
      growth: champion.manaGrowth,
      calculated: stats?.resourcePoints,
    },
  ];

  const otherStats = [
    ["Health Regeneration", champion.healthRegenBase,
      champion.healthRegenGrowth],
    ["Mana Regeneration", champion.manaRegenBase,
      champion.manaRegenGrowth],
    ["Attack Speed", champion.attackSpeedBase,
      champion.attackSpeedGrowth],
    ["Critical Strike", champion.criticalStrikeBase,
      champion.criticalStrikeGrowth],
    ["Movement Speed", champion.movementSpeed, null],
    ["Attack Range", champion.attackRange, null],
  ];

  function formatValue(value) {
    return value == null
      ? "—"
      : Number(value).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
  }

  return (
    <>
      <Link to="/champions" className="back-link">
        <ArrowLeft size={17} />
        Back to Champion Explorer
      </Link>

      <header className="champion-profile-header">
        <div>
          <p className="eyebrow">
            DATABASE / CHAMPION DETAILS
          </p>

          <h1>{champion.championName}</h1>

          <p className="subtitle">
            {champion.roles || "Unclassified"}
            {" · "}
            {champion.resourceType || "No Resource"}
          </p>
        </div>

        <div className="profile-meta">
          <span className="patch-badge">
            PATCH {champion.patch || "UNKNOWN"}
          </span>

          <span className="champion-id">
            Champion ID: {champion.championId}
          </span>
        </div>
      </header>

      <section className="dashboard-panel">
        <div className="profile-section-heading">
          <div>
            <h2>Champion Statistics</h2>
            <p>
              View base values and estimated
              level-based statistics.
            </p>
          </div>

          <label className="level-selector">
            Champion Level
            <select
              value={level}
              onChange={(event) =>
                setLevel(Number(event.target.value))
              }
            >
              {Array.from({ length: 20 }, (_, index) => {
                const value = index + 1;

                return (
                  <option key={value} value={value}>
                    Level {value}
                    {value > 18 ? " (Top Quest)" : ""}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        {statsLoading && (
          <p role="status">
            Calculating level {level} statistics...
          </p>
        )}

        {statsError && (
          <p className="error-message" role="alert">
            Unable to calculate statistics: {statsError}
          </p>
        )}

        {!statsLoading && !statsError && stats && (
          <div className="champion-stats-grid">
            {statCards.map((stat) => (
              <ChampionStatCard
                key={stat.label}
                label={stat.label}
                base={stat.base}
                growth={stat.growth}
                calculated={stat.calculated}
              />
            ))}
          </div>
        )}

        <p className="chart-note">
          Values are calculated using the standard
          champion growth formula. Item bonuses,
          runes, ability modifiers, and special
          champion scaling are not included.
        </p>
      </section>

      <section className="dashboard-panel">
        <h2>Additional Statistics</h2>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Statistic</th>
                <th>Base Value</th>
                <th>Growth Coefficient</th>
              </tr>
            </thead>

            <tbody>
              {otherStats.map(([label, base, growth]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{formatValue(base)}</td>
                  <td>{formatValue(growth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ChampionDetails;