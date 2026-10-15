function ChampionStatCard({
  label,
  base,
  growth,
  calculated,
}) {
  function formatValue(value) {
    if (value == null) {
      return "—";
    }

    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }

  return (
    <article className="champion-stat-card">
      <h3>{label}</h3>

      <div className="champion-stat-main">
        {formatValue(
          calculated !== undefined ? calculated : base
        )}
      </div>

      <div className="champion-stat-meta">
        <span>
          Base: <strong>{formatValue(base)}</strong>
        </span>

        <span>
          Growth: <strong>{formatValue(growth)}</strong>
        </span>
      </div>
    </article>
  );
}

export default ChampionStatCard;