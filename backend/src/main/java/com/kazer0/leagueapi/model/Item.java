package com.kazer0.leagueapi.model;

public record Item(
    int itemId,
    String itemName,

    int goldCost,
    Integer sellPrice,

    Double attackDamage,
    Double abilityPower,
    Double health,
    Double mana,
    Double armor,
    Double magicResist,
    Double attackSpeed,
    Double criticalStrike,
    Double movementSpeed,
    Double abilityHaste,

    String descriptionRaw,
    String patch
) {}