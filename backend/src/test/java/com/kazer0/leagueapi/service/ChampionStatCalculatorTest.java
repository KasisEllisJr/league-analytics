package com.kazer0.leagueapi.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChampionStatCalculatorTest {

    @Test
    void levelOneReturnsBaseStat() {

        double result =
            ChampionStatCalculator.calculate(600, 100, 1);

        assertEquals(600.0, result, 0.001);
    }

    @Test
    void levelEighteenAppliesFullGrowth() {

        double result =
            ChampionStatCalculator.calculate(600, 100, 18);

        assertEquals(2300.0, result, 0.001);
    }

    @Test
    void levelTwoUsesNonLinearGrowth() {

        double result =
            ChampionStatCalculator.calculate(600, 100, 2);

        assertEquals(672.0, result, 0.001);
    }

    @Test
    void zeroGrowthPreservesBaseStat() {

        double result =
            ChampionStatCalculator.calculate(600, 0, 10);

        assertEquals(600.0, result, 0.001);
    }

    @Test
    void invalidLevelThrowsException() {

        assertThrows(
            IllegalArgumentException.class,
            () -> ChampionStatCalculator.calculate(
                600, 100, 19
            )
        );
    }
}