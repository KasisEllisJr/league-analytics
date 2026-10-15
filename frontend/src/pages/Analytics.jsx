import ChampionRankingChart from "../components/charts/ChampionRankingChart";
import ChampionLevelChart from "../components/charts/ChampionLevelChart";

function Analytics() {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            STATISTICS / ANALYTICS
          </p>

          <h1>Champion Analytics</h1>

          <p className="subtitle">
            Explore champion rankings and level-based
            statistics calculated by the Java backend.
          </p>
        </div>

        <span className="patch-badge">PATCH 26.20</span>
      </header>

      <div className="analytics-grid">
        <ChampionRankingChart />
        <ChampionLevelChart />
      </div>
    </>
  );
}

export default Analytics;