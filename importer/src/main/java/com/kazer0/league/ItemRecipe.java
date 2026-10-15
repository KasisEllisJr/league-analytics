package com.kazer0.league;

public record ItemRecipe(
        int itemId,
        int componentId,
        int quantity,
        boolean componentInDataset,
        String patch
) {}