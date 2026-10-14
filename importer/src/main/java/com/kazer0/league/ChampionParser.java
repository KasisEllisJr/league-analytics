package com.kazer0.league;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ChampionParser {

    public static List<Champion> parseChampions(String json)
            throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        JsonNode champions = root.path("data");

        if (!champions.isObject() || champions.isEmpty()) {
            throw new IllegalArgumentException(
                "Champion data is missing or invalid."
            );
        }

        List<Champion> championList = new ArrayList<>();

        for (Map.Entry<String, JsonNode> entry
                : champions.properties()) {

            JsonNode champion = entry.getValue();
            JsonNode stats = champion.path("stats");

            int id = Integer.parseInt(
                requiredText(champion, "key")
            );

            String name = requiredText(champion, "name");
            String resourceType =
                champion.path("partype").asText("");

            List<String> tags = new ArrayList<>();

            for (JsonNode tag : champion.path("tags")) {
                tags.add(tag.asText());
            }

            String roles = String.join("|", tags);

            Champion championObject = new Champion(
                id,
                name,
                roles,
                resourceType,

                requiredStat(stats, "hp"),
                requiredStat(stats, "hpperlevel"),

                requiredStat(stats, "mp"),
                requiredStat(stats, "mpperlevel"),

                requiredStat(stats, "hpregen"),
                requiredStat(stats, "hpregenperlevel"),

                requiredStat(stats, "mpregen"),
                requiredStat(stats, "mpregenperlevel"),

                requiredStat(stats, "attackdamage"),
                requiredStat(stats, "attackdamageperlevel"),

                requiredStat(stats, "armor"),
                requiredStat(stats, "armorperlevel"),

                requiredStat(stats, "spellblock"),
                requiredStat(stats, "spellblockperlevel"),

                requiredStat(stats, "attackspeed"),
                requiredStat(stats, "attackspeedperlevel"),

                requiredStat(stats, "crit"),
                requiredStat(stats, "critperlevel"),

                requiredStat(stats, "movespeed"),
                requiredStat(stats, "attackrange"),

                "26.20"
            );

            championList.add(championObject);
        }

        return championList;
    }

    private static double requiredStat(
            JsonNode stats,
            String field
    ) {
        JsonNode value = stats.path(field);

        if (!value.isNumber()
                || !Double.isFinite(value.asDouble())) {
            throw new IllegalArgumentException(
                "Missing or invalid statistic: " + field
            );
        }

        return value.asDouble();
    }

    private static String requiredText(
            JsonNode champion,
            String field
    ) {
        JsonNode value = champion.path(field);

        if (!value.isTextual() || value.asText().isBlank()) {
            throw new IllegalArgumentException(
                "Missing or invalid champion field: " + field
            );
        }

        return value.asText();
    }
}