package com.kazer0.leagueapi.model;

public record ItemRecipe(
    int itemId,
    int componentId,
    Integer quantity,
    boolean componentInDataset,
    String componentName,
    String patch
) {}