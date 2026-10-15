package com.kazer0.league;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ItemParser {

    public static List<Item> parseItems(String json)
            throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode items = root.path("data");

        if (!items.isObject() || items.isEmpty()) {
            throw new IllegalArgumentException(
                "Item data is missing or invalid."
            );
        }

        List<Item> itemList = new ArrayList<>();

        for (Map.Entry<String, JsonNode> entry
                : items.properties()) {

            JsonNode item = entry.getValue();

            // Only include Summoner's Rift items
            boolean summonersRift =
                item.path("maps").path("11").asBoolean(false);

            // Only include purchasable items
            boolean purchasable =
                item.path("gold")
                    .path("purchasable")
                    .asBoolean(false);

            // Exclude items hidden from normal shops
            boolean hidden =
                item.path("hideFromAll").asBoolean(false);

            // Some special items are not in the shop
            boolean inStore =
                item.path("inStore").asBoolean(true);

            if (!summonersRift || !purchasable
                    || hidden || !inStore) {
                continue;
            }

            JsonNode stats = item.path("stats");

            int id = Integer.parseInt(entry.getKey());

            String name = item.path("name").asText();

            int goldCost =
                item.path("gold").path("total").asInt();

            int sellPrice =
                item.path("gold").path("sell").asInt();

            Item itemObject = new Item(
                id,
                name,
                goldCost,
                sellPrice,

                getStat(stats, "FlatPhysicalDamageMod"),
                getStat(stats, "FlatMagicDamageMod"),
                getStat(stats, "FlatHPPoolMod"),
                getStat(stats, "FlatMPPoolMod"),
                getStat(stats, "FlatArmorMod"),
                getStat(stats, "FlatSpellBlockMod"),

                getPercentage(stats, "PercentAttackSpeedMod"),
                getPercentage(stats, "FlatCritChanceMod"),

                getStat(stats, "FlatMovementSpeedMod"),

                ItemDescriptionParser.extractAbilityHaste(
                    item.path("description").asText("")
                ),

                item.path("description").asText(""),
                "26.20"
            );

            itemList.add(itemObject);
        }

        return itemList;
    }

    private static Double getStat(
            JsonNode stats,
            String field
    ) {
        JsonNode value = stats.path(field);

        if (!value.isNumber()) {
            return null;
        }

        return value.asDouble();
    }

    private static Double getPercentage(
            JsonNode stats,
            String field
    ) {
        Double value = getStat(stats, field);

        if (value == null) {
            return null;
        }

        return value * 100;
    }
}