export function calculateStatPer1000Gold(
  statValue,
  goldCost
) {
  if (
    typeof statValue !== "number" ||
    !Number.isFinite(statValue) ||
    statValue <= 0 ||
    typeof goldCost !== "number" ||
    !Number.isFinite(goldCost) ||
    goldCost <= 0
  ) {
    return null;
  }

  return Number(
    ((statValue / goldCost) * 1000).toFixed(2)
  );
}