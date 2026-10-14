package com.kazer0.league;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Iterator;
import java.util.Map;

public class ChampionParser {

    public static void printAllChampions(String json)
            throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode champions = root.path("data");

        Iterator<Map.Entry<String, JsonNode>> iterator =
                champions.fields();

        int count = 0;

        while (iterator.hasNext()) {

            Map.Entry<String, JsonNode> entry =
                    iterator.next();

            JsonNode champion = entry.getValue();
            JsonNode stats = champion.path("stats");

            String name = champion.path("name").asText();
            double health = stats.path("hp").asDouble();
            double armor = stats.path("armor").asDouble();
            double attackDamage =
                    stats.path("attackdamage").asDouble();

            System.out.println("------------------------");
            System.out.println("Champion: " + name);
            System.out.println("Health: " + health);
            System.out.println("Armor: " + armor);
            System.out.println("Attack Damage: " + attackDamage);

            count++;
        }

        System.out.println("------------------------");
        System.out.println("Total champions processed: " + count);
    }
}