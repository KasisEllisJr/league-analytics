import RoleAverageChart
  from "../components/charts/RoleAverageChart";

import ItemValueChart
  from "../components/charts/ItemValueChart";

function AdvancedAnalytics() {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            ANALYTICS / ADVANCED
          </p>

          <h1>Advanced Analytics</h1>

          <p className="subtitle">
            Explore champion role averages and
            item cost-normalized statistics.
          </p>
        </div>

        <span className="patch-badge">
          PATCH 26.20
        </span>
      </header>

      <div className="advanced-analytics-intro">
        <h2>Understanding the Data</h2>

        <p>
          These visualizations use the imported League
          of Legends dataset to calculate role-level
          statistical averages and item attribute-to-cost
          ratios.
        </p>

        <p>
          All calculations exclude missing values.
          Results describe recorded dataset attributes,
          not overall champion or item strength.
        </p>
      </div>

      <div className="advanced-analytics-stack">
        <RoleAverageChart />
        <ItemValueChart />
      </div>
    </>
  );
}

export default AdvancedAnalytics;