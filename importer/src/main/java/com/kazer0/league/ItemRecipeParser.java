package com.kazer0.league;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ItemRecipeParser {

    public static List<ItemRecipe> parseRecipes(
            String json,
            List<Item> importedItems
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();

        JsonNode root = mapper.readTree(json);
        JsonNode itemData = root.path("data");

        if (!itemData.isObject()) {
            throw new IllegalArgumentException(
                "Invalid item recipe source."
            );
        }

        Set<Integer> importedIds = new HashSet<>();

        for (Item item : importedItems) {
            importedIds.add(item.itemId());
        }

        List<ItemRecipe> recipes = new ArrayList<>();

        for (Item item : importedItems) {

            JsonNode sourceItem = itemData.path(
                String.valueOf(item.itemId())
            );

            JsonNode components = sourceItem.path("from");

            if (!components.isArray()) {
                continue;
            }

            Map<Integer, Integer> counts = new HashMap<>();

            for (JsonNode component : components) {

                int componentId =
                    Integer.parseInt(component.asText());

                counts.merge(componentId, 1, Integer::sum);
            }

            for (Map.Entry<Integer, Integer> entry
                    : counts.entrySet()) {

                int componentId = entry.getKey();

                recipes.add(new ItemRecipe(
                    item.itemId(),
                    componentId,
                    entry.getValue(),
                    importedIds.contains(componentId),
                    "26.20"
                ));
            }
        }

        return recipes;
    }
}