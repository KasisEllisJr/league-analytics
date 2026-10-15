package com.kazer0.league;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class DatasetAuditor {

    private static final String PATCH = "26.20";
    private static final String VERSION = "16.20.1";

    public static void audit(Path datasetDirectory)
            throws Exception {

        System.out.println("\n========================");
        System.out.println("DATASET VALIDATION REPORT");
        System.out.println("========================");

        List<CSVRecord> champions = readCsv(
            datasetDirectory.resolve("champions.csv"),
            "champion_id", "champion_name", "patch"
        );

        List<CSVRecord> items = readCsv(
            datasetDirectory.resolve("items.csv"),
            "item_id", "item_name", "gold_cost", "patch"
        );

        List<CSVRecord> recipes = readCsv(
            datasetDirectory.resolve("item_recipes.csv"),
            "item_id", "component_id", "quantity", "patch"
        );

        List<CSVRecord> effects = readCsv(
            datasetDirectory.resolve("item_effects.csv"),
            "item_id", "effect_name",
            "effect_description", "patch"
        );

        Set<String> championIds = new HashSet<>();
        Set<String> itemIds = new HashSet<>();
        List<String> warnings = new ArrayList<>();

        // Validate champion IDs
        for (CSVRecord champion : champions) {

            checkPatch(champion);

            String id = champion.get("champion_id");

            if (id.isBlank()
                    || !championIds.add(id)) {
                throw new IllegalStateException(
                    "Invalid or duplicate champion ID: " + id
                );
            }

            requireText(champion, "champion_name");
        }

        // Validate item IDs and prices
        for (CSVRecord item : items) {

            checkPatch(item);

            String id = item.get("item_id");

            if (id.isBlank() || !itemIds.add(id)) {
                throw new IllegalStateException(
                    "Invalid or duplicate item ID: " + id
                );
            }

            requireText(item, "item_name");

            int price = Integer.parseInt(
                item.get("gold_cost")
            );

            if (price < 0) {
                throw new IllegalStateException(
                    "Negative item price: " + id
                );
            }
        }

        // Validate item recipes
        Set<String> recipeKeys = new HashSet<>();

        for (CSVRecord recipe : recipes) {

            checkPatch(recipe);

            String itemId = recipe.get("item_id");
            String componentId = recipe.get("component_id");

            String key = itemId + ":" + componentId;

            if (!recipeKeys.add(key)) {
                throw new IllegalStateException(
                    "Duplicate recipe relationship: " + key
                );
            }

            if (!itemIds.contains(itemId)) {
                throw new IllegalStateException(
                    "Recipe parent item missing: " + itemId
                );
            }

            int quantity = Integer.parseInt(
                recipe.get("quantity")
            );

            if (quantity <= 0) {
                throw new IllegalStateException(
                    "Invalid recipe quantity: " + key
                );
            }

            if (!itemIds.contains(componentId)) {

                if (componentId.equals("3867")) {
                    // Known exception: Bounty of Worlds
                    // Intermediate support item excluded from analytics.
                    continue;
                }

                warnings.add(
                    "Recipe component not in items.csv: "
                    + componentId + " for item " + itemId
                );
            }

            } // Closes the item recipe for-loop

            // Validate item effects
            for (CSVRecord effect : effects) {

            checkPatch(effect);

            String itemId = effect.get("item_id");

            if (!itemIds.contains(itemId)) {
                throw new IllegalStateException(
                    "Effect references missing item: " + itemId
                );
            }

            requireText(effect, "effect_name");
            requireText(effect, "effect_description");
        }

        System.out.println(
            "Champions validated: " + champions.size()
        );

        System.out.println(
            "Items validated: " + items.size()
        );

        System.out.println(
            "Recipe relationships: " + recipes.size()
        );

        System.out.println(
            "Effects validated: " + effects.size()
        );

        System.out.println(
            "Warnings: " + warnings.size()
        );

        for (String warning : warnings) {
            System.out.println("WARNING: " + warning);
        }

        // Generate source metadata
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode metadata = mapper.createObjectNode();

        metadata.put("patch", PATCH);
        metadata.put("data_dragon_version", VERSION);
        metadata.put("generated_at", Instant.now().toString());

        metadata.put(
            "champion_count", champions.size()
        );

        metadata.put(
            "item_count", items.size()
        );

        metadata.put(
            "recipe_relationship_count", recipes.size()
        );

        metadata.put(
            "effect_count", effects.size()
        );

        metadata.put(
            "validation_status",
            warnings.isEmpty()
                ? "PASSED"
                : "PASSED_WITH_WARNINGS"
        );

        metadata.put("warning_count", warnings.size());
        
        metadata.put(
            "known_exception",
            "Item 3867 (Bounty of Worlds) is an intermediate "
            + "support item excluded from the main item dataset. "
            + "Five recipe references are intentionally preserved."
        );

        metadata.put(
            "champion_source",
            "https://ddragon.leagueoflegends.com/cdn/"
            + VERSION + "/data/en_US/champion.json"
        );

        metadata.put(
            "item_source",
            "https://ddragon.leagueoflegends.com/cdn/"
            + VERSION + "/data/en_US/item.json"
        );

        metadata.put(
            "wiki_reference",
            "https://wiki.leagueoflegends.com/en-us/"
        );

        metadata.put(
            "validation_scope",
            "Structural and referential checks only; "
            + "statistical accuracy and source completeness "
            + "require additional verification."
        );

        metadata.set(
            "warnings",
            mapper.valueToTree(warnings)
        );

        Path metadataPath =
            datasetDirectory.resolve("metadata.json");

        mapper.writerWithDefaultPrettyPrinter()
            .writeValue(metadataPath.toFile(), metadata);

        System.out.println(
            "\nMetadata written to: " + metadataPath
        );

        System.out.println(
            "Dataset structural audit completed!"
        );
    }

    private static List<CSVRecord> readCsv(
            Path path,
            String... requiredColumns
    ) throws Exception {

        if (!Files.isRegularFile(path)) {
            throw new IllegalStateException(
                "Missing dataset: " + path
            );
        }

        CSVFormat format = CSVFormat.DEFAULT.builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .get();

        try (CSVParser parser = format.parse(
                Files.newBufferedReader(
                    path, StandardCharsets.UTF_8
                )
        )) {

            for (String column : requiredColumns) {
                if (!parser.getHeaderMap().containsKey(column)) {
                    throw new IllegalStateException(
                        "Missing column " + column
                        + " in " + path.getFileName()
                    );
                }
            }

            List<CSVRecord> rows = parser.getRecords();

            if (rows.isEmpty()) {
                throw new IllegalStateException(
                    "Empty dataset: " + path
                );
            }

            for (CSVRecord row : rows) {
                if (!row.isConsistent()) {
                    throw new IllegalStateException(
                        "Malformed CSV row in " + path
                    );
                }
            }

            return rows;
        }
    }

    private static void checkPatch(CSVRecord row) {

        if (!PATCH.equals(row.get("patch"))) {
            throw new IllegalStateException(
                "Unexpected patch: " + row.get("patch")
            );
        }
    }

    private static void requireText(
            CSVRecord row,
            String field
    ) {

        if (row.get(field).isBlank()) {
            throw new IllegalStateException(
                "Missing value for: " + field
            );
        }
    }
}