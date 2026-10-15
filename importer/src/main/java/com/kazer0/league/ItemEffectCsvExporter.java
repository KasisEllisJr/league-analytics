package com.kazer0.league;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class ItemEffectCsvExporter {

    public static void export(
            List<ItemEffect> effects,
            Path outputPath
    ) throws Exception {

        Files.createDirectories(outputPath.getParent());

        CSVFormat format = CSVFormat.DEFAULT.builder()
            .setHeader(
                "item_id",
                "effect_name",
                "effect_description",
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

            for (ItemEffect effect : effects) {

                printer.printRecord(
                    effect.itemId(),
                    effect.effectName(),
                    effect.effectDescription(),
                    effect.patch()
                );
            }
        }

        System.out.println(
            "Item effects exported: " + effects.size()
        );
    }
}