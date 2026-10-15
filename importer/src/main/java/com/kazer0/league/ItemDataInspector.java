package com.kazer0.league;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ItemDataInspector {

    public static void inspect(
            String json,
            String itemName
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode items = root.path("data");

        for (JsonNode item : items) {

            String name = item.path("name").asText();

            if (!name.equalsIgnoreCase(itemName)) {
                continue;
            }

            System.out.println("\n======================");
            System.out.println("ITEM: " + name);
            System.out.println("======================");

            System.out.println("\nSTRUCTURED STATS:");

            System.out.println(
                item.path("stats").toPrettyString()
            );

            System.out.println("\nITEM DESCRIPTION:");

            System.out.println(
                item.path("description").asText()
            );

            System.out.println("\nGOLD:");

            System.out.println(
                item.path("gold").toPrettyString()
            );

            System.out.println("======================");

            return;
        }

        System.out.println(
            "Item not found in source JSON: " + itemName
        );
    }

    public static void inspectById(String json, String itemId)
            throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode item = root.path("data").path(itemId);

        if (item.isMissingNode()) {
            System.out.println("Item not found: " + itemId);
            return;
        }

        System.out.println("\nITEM ID: " + itemId);
        System.out.println("Name: " + item.path("name").asText());

        System.out.println(
            "Summoner's Rift: "
            + item.path("maps").path("11").asBoolean(false)
        );

        System.out.println(
            "Purchasable: "
            + item.path("gold")
                .path("purchasable").asBoolean(false)
        );

        System.out.println(
            "Hidden: "
            + item.path("hideFromAll").asBoolean(false)
        );

        System.out.println(
            "In Store: "
            + item.path("inStore").asBoolean(true)
        );

        System.out.println(
            "Gold: " + item.path("gold").toPrettyString()
        );
    }
}