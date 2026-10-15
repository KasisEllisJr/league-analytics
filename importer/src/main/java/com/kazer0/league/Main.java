package com.kazer0.league;

import java.nio.file.Path;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        try {
            System.out.println(
                "Starting League Analytics Importer..."
            );

            // CHAMPION DATA IMPORT

            System.out.println("\nFetching champions...");

            String championJson =
                DataDragonClient.fetchChampions();

            List<Champion> champions =
                ChampionParser.parseChampions(championJson);

            ChampionValidator.validate(champions);

            Path championPath = Path.of(
                "..",
                "datasets",
                "patch-26.20",
                "champions.csv"
            ).toAbsolutePath().normalize();

            ChampionCsvExporter.export(
                champions, championPath
            );

            // ITEM DATA IMPORT

            System.out.println("\nFetching items...");

            String itemJson =
                DataDragonClient.fetchItems();

                ItemDataInspector.inspect(itemJson, "3867");

            String[] inspectItems = {
                "Infinity Edge",
                "Rabadon's Deathcap",
                "Trinity Force",
                "Long Sword",
                "Amplifying Tome"
            };

            for (String name : inspectItems) {
                ItemDataInspector.inspect(itemJson, name);
            }

            List<Item> items =
                ItemParser.parseItems(itemJson);

            ItemValidator.validate(items);

            ItemDataQualityReport.generate(items);

            String[] testItems = {
                "Infinity Edge",
                "Rabadon's Deathcap",
                "Trinity Force",
                "Long Sword",
                "Amplifying Tome"
            };

            for (String testName : testItems) {

                items.stream()
                    .filter(item ->
                        item.itemName().equalsIgnoreCase(testName))
                    .forEach(item -> {

                        System.out.println("\nItem: " + item.itemName());
                        System.out.println("Gold: " + item.goldCost());
                        System.out.println("AD: " + item.attackDamage());
                        System.out.println("AP: " + item.abilityPower());
                        System.out.println("Health: " + item.health());
                        System.out.println("Attack Speed: " + item.attackSpeed());
                        System.out.println("Ability Haste: " + item.abilityHaste());
                    });
            }

            Path itemPath = Path.of(
                "..",
                "datasets",
                "patch-26.20",
                "items.csv"
            ).toAbsolutePath().normalize();

            ItemCsvExporter.export(
                items, itemPath
            );

            System.out.println("\nParsing item recipes...");

            List<ItemRecipe> recipes =
                ItemRecipeParser.parseRecipes(itemJson, items);

            Path recipePath = Path.of(
                "..",
                "datasets",
                "patch-26.20",
                "item_recipes.csv"
            ).toAbsolutePath().normalize();

            ItemRecipeCsvExporter.export(recipes, recipePath);

            long missingComponents = recipes.stream()
                .filter(recipe -> !recipe.componentInDataset())
                .count();

            System.out.println("\nParsing item effects...");

            List<ItemEffect> effects =
                ItemEffectParser.parseEffects(itemJson, items);

            Path effectsPath = Path.of(
                "..",
                "datasets",
                "patch-26.20",
                "item_effects.csv"
            ).toAbsolutePath().normalize();

            ItemEffectCsvExporter.export(
                effects,
                effectsPath
            );

            System.out.println("\nStarting dataset audit...");

            Path datasetDirectory = Path.of(
                "..",
                "datasets",
                "patch-26.20"
            ).toAbsolutePath().normalize();

            DatasetAuditor.audit(datasetDirectory);

            System.out.println(
                "Total passive effects: " + effects.size()
            );

            System.out.println(
                "Recipe components outside item dataset: "
                + missingComponents
            );

            System.out.println(
                "\nLeague Analytics import completed!"
            );

            System.out.println(
                "Champions exported: " + champions.size()
            );

            System.out.println(
                "Items exported: " + items.size()
            );

        } catch (Exception e) {

            System.err.println(
                "Import failed: " + e.getMessage()
            );

            throw new RuntimeException(
                "League Analytics import failed", e
            );
        }
    }
}