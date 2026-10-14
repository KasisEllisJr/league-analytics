package com.kazer0.league;

public record Champion(
        int championId,
        String championName,
        String roles,
        String resourceType,

        double healthBase,
        double healthGrowth,

        double manaBase,
        double manaGrowth,

        double healthRegenBase,
        double healthRegenGrowth,

        double manaRegenBase,
        double manaRegenGrowth,

        double attackDamageBase,
        double attackDamageGrowth,

        double armorBase,
        double armorGrowth,

        double magicResistBase,
        double magicResistGrowth,

        double attackSpeedBase,
        double attackSpeedGrowth,

        double criticalStrikeBase,
        double criticalStrikeGrowth,

        double movementSpeed,
        double attackRange,

        String patch
) {}