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

        if (!champions.isObject()) {
            throw new IllegalArgumentException(
                "Champion data is missing or invalid."
            );
        }

        List<Champion> championList = new ArrayList<>();

        for (Map.Entry<String, JsonNode> entry
                : champions.properties()) {

            JsonNode champion = entry.getValue();
            JsonNode stats = champion.path("stats");

            String championId = champion.path("key").asText();
            String name = champion.path("name").asText();

            List<String> tags = new ArrayList<>();

            for (JsonNode tag : champion.path("tags")) {
                tags.add(tag.asText());
            }

            String roles = String.join("|", tags);

            Champion championObject = new Champion(
                Integer.parseInt(championId),
                name,
                roles,
                stats.path("hp").asDouble(),
                stats.path("hpperlevel").asDouble(),
                stats.path("attackdamage").asDouble(),
                stats.path("attackdamageperlevel").asDouble(),
                stats.path("armor").asDouble(),
                stats.path("armorperlevel").asDouble(),
                stats.path("spellblock").asDouble(),
                stats.path("spellblockperlevel").asDouble(),
                stats.path("attackspeed").asDouble(),
                stats.path("attackspeedperlevel").asDouble(),
                stats.path("movespeed").asDouble(),
                stats.path("attackrange").asDouble(),
                "26.20"
            );

            championList.add(championObject);
        }

        return championList;
    }
}