package com.kazer0.leagueapi.model;

public record ItemEffect(
    int effectId,
    int itemId,
    String effectName,
    String effectDescription,
    String patch
) {}