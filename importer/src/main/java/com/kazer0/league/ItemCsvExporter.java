package com.kazer0.league;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class ItemCsvExporter {

    public static void export(
            List<Item> items,
            Path outputPath
    ) throws IOException {

        Files.createDirectories(outputPath.getParent());

        CSVFormat format = CSVFormat.DEFAULT.builder()
            .setHeader(
                "item_id",
                "item_name",
                "gold_cost",
                "sell_price",
                "attack_damage",
                "ability_power",
                "health",
                "mana",
                "armor",
                "magic_resist",
                "attack_speed",
                "critical_strike",
                "movement_speed",
                "ability_haste",
                "description_raw",
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

            for (Item item : items) {

                printer.printRecord(
                    item.itemId(),
                    item.itemName(),
                    item.goldCost(),
                    item.sellPrice(),
                    item.attackDamage(),
                    item.abilityPower(),
                    item.health(),
                    item.mana(),
                    item.armor(),
                    item.magicResist(),
                    item.attackSpeed(),
                    item.criticalStrike(),
                    item.movementSpeed(),
                    item.abilityHaste(),
                    item.descriptionRaw(),
                    item.patch()
                );
            }
        }

        System.out.println(
            "Item CSV exported: " + outputPath
        );
    }
}