package com.kazer0.league;

public record ItemEffect(
        int itemId,
        String effectName,
        String effectDescription,
        String patch
) {}