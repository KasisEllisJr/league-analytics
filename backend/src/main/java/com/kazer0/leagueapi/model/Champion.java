package com.kazer0.leagueapi.model;

public record Champion(
    int championId,
    String championName,
    String roles,
    String resourceType,

    Double healthBase,
    Double healthGrowth,
    Double manaBase,
    Double manaGrowth,

    Double healthRegenBase,
    Double healthRegenGrowth,
    Double manaRegenBase,
    Double manaRegenGrowth,

    Double attackDamageBase,
    Double attackDamageGrowth,
    Double armorBase,
    Double armorGrowth,
    Double magicResistBase,
    Double magicResistGrowth,

    Double attackSpeedBase,
    Double attackSpeedGrowth,
    Double criticalStrikeBase,
    Double criticalStrikeGrowth,

    Double movementSpeed,
    Double attackRange,
    String patch
) {}