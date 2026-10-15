import {
  describe,
  it,
  expect,
} from "vitest";

import {
  calculateStatPer1000Gold,
} from "./analytics";

describe("Item value calculations", () => {

  it("calculates attack damage per 1000 gold", () => {
    const result = calculateStatPer1000Gold(
      50,
      2500
    );

    expect(result).toBe(20);
  });

  it("supports decimal results", () => {
    const result = calculateStatPer1000Gold(
      45,
      2000
    );

    expect(result).toBe(22.5);
  });

  it("rejects zero-cost items", () => {
    const result = calculateStatPer1000Gold(
      50,
      0
    );

    expect(result).toBeNull();
  });

  it("rejects missing statistics", () => {
    const result = calculateStatPer1000Gold(
      null,
      2500
    );

    expect(result).toBeNull();
  });

  it("rejects negative statistics", () => {
    const result = calculateStatPer1000Gold(
      -10,
      2500
    );

    expect(result).toBeNull();
  });

  it("rounds results to two decimals", () => {
    const result = calculateStatPer1000Gold(
      40,
      2700
    );

    expect(result).toBe(14.81);
  });
});