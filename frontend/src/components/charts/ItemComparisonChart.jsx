import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATS = [
  ["Attack Damage", "attackDamage"],
  ["Ability Power", "abilityPower"],
  ["Health", "health"],
  ["Mana", "mana"],
  ["Armor", "armor"],
  ["Magic Resist", "magicResist"],
  ["Attack Speed", "attackSpeed"],
  ["Critical Strike", "criticalStrike"],
  ["Movement Speed", "movementSpeed"],
  ["Ability Haste", "abilityHaste"],
];

function ItemComparisonChart({ firstItem, secondItem }) {
  const data = STATS
    .filter(
      ([, key]) =>
        firstItem[key] != null ||
        secondItem[key] != null
    )
    .map(([name, key]) => ({
      name,
      first: firstItem[key] ?? null,
      second: secondItem[key] ?? null,
    }));

  if (data.length === 0) {
    return (
      <p>
        Neither item has structured statistics
        available for charting.
      </p>
    );
  }

  return (
    <div
      className="item-comparison-chart"
      style={{
        height: Math.max(340, data.length * 58),
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 25,
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
            stroke="#9ca3af"
          />

          <YAxis
            type="category"
            dataKey="name"
            width={112}
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#111a28",
              border: "1px solid #304057",
              borderRadius: "8px",
              color: "#f8fafc",
            }}
            formatter={(value) =>
              value == null ? "Not recorded" : value
            }
          />

          <Legend />

          <Bar
            dataKey="first"
            name={firstItem.itemName}
            fill="#00d4aa"
            maxBarSize={18}
          />

          <Bar
            dataKey="second"
            name={secondItem.itemName}
            fill="#7c8cff"
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ItemComparisonChart;