package com.kazer0.league;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ItemEffectParser {

    private static final Pattern PASSIVE_PATTERN =
        Pattern.compile(
            "<passive>(.*?)</passive>(.*?)(?=<passive>|</mainText>|$)",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
        );

    public static List<ItemEffect> parseEffects(
            String json,
            List<Item> importedItems
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        JsonNode allItems = root.path("data");

        List<ItemEffect> effects = new ArrayList<>();

        for (Item item : importedItems) {

            JsonNode sourceItem = allItems.path(
                String.valueOf(item.itemId())
            );

            String description =
                sourceItem.path("description").asText("");

            Matcher matcher =
                PASSIVE_PATTERN.matcher(description);

            while (matcher.find()) {

                String effectName =
                    cleanText(matcher.group(1));

                String effectDescription =
                    cleanText(matcher.group(2));

                if (effectName.isBlank()) {
                    continue;
                }

                effects.add(new ItemEffect(
                    item.itemId(),
                    effectName,
                    effectDescription,
                    "26.20"
                ));
            }
        }

        return effects;
    }

    private static String cleanText(String text) {

        return text
            .replaceAll("(?i)<br\\s*/?>", " ")
            .replaceAll("<[^>]+>", " ")
            .replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replaceAll("\\s+", " ")
            .trim();
    }
}