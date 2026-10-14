package com.kazer0.league;

public record Champion(
        int championId,
        String championName,
        String roles,
        double healthBase,
        double healthGrowth,
        double attackDamageBase,
        double attackDamageGrowth,
        double armorBase,
        double armorGrowth,
        double magicResistBase,
        double magicResistGrowth,
        double attackSpeedBase,
        double attackSpeedGrowth,
        double movementSpeed,
        double attackRange,
        String patch
) {}