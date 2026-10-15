package com.kazer0.league;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;

public class ItemRecipeCsvExporter {

    public static void export(
            List<ItemRecipe> recipes,
            Path outputPath
    ) throws Exception {

        Files.createDirectories(outputPath.getParent());

        CSVFormat format = CSVFormat.DEFAULT.builder()
            .setHeader(
                "item_id",
                "component_id",
                "quantity",
                "component_in_dataset",
                "patch"
            )
            .get();

        try (CSVPrinter printer = new CSVPrinter(
                Files.newBufferedWriter(
                    outputPath,
                    StandardCharsets.UTF_8
                ),
                format
        )) {

            List<ItemRecipe> sortedRecipes =
                recipes.stream()
                    .sorted(
                        Comparator.comparingInt(
                            ItemRecipe::itemId
                        ).thenComparingInt(
                            ItemRecipe::componentId
                        )
                    )
                    .toList();

            for (ItemRecipe recipe : sortedRecipes) {

                printer.printRecord(
                    recipe.itemId(),
                    recipe.componentId(),
                    recipe.quantity(),
                    recipe.componentInDataset(),
                    recipe.patch()
                );
            }
        }

        System.out.println(
            "Item recipes exported: " + recipes.size()
        );
    }
}