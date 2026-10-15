package com.kazer0.leagueapi.service;

public final class ChampionStatCalculator {

    public static final int MAX_LEVEL = 20;

    private ChampionStatCalculator() {
    }

    public static double calculate(
            double base,
            double growth,
            int level
    ) {
        if (level < 1 || level > MAX_LEVEL) {
            throw new IllegalArgumentException(
                "Level must be between 1 and 20."
            );
        }

        double levelsGained = level - 1;

        double multiplier = levelsGained
                * (0.7025 + 0.0175 * levelsGained);

        return base + growth * multiplier;
    }
}