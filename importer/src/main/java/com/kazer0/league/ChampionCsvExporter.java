package com.kazer0.league;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class ChampionCsvExporter {

    public static void export(
            List<Champion> champions,
            Path outputPath
    ) throws IOException {

        Files.createDirectories(outputPath.getParent());

        CSVFormat format = CSVFormat.DEFAULT.builder()
            .setHeader(
                "champion_id",
                "champion_name",
                "roles",
                "health_base",
                "health_growth",
                "attack_damage_base",
                "attack_damage_growth",
                "armor_base",
                "armor_growth",
                "magic_resist_base",
                "magic_resist_growth",
                "attack_speed_base",
                "attack_speed_growth",
                "movement_speed",
                "attack_range",
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

            for (Champion champion : champions) {

                printer.printRecord(
                    champion.championId(),
                    champion.championName(),
                    champion.roles(),
                    champion.healthBase(),
                    champion.healthGrowth(),
                    champion.attackDamageBase(),
                    champion.attackDamageGrowth(),
                    champion.armorBase(),
                    champion.armorGrowth(),
                    champion.magicResistBase(),
                    champion.magicResistGrowth(),
                    champion.attackSpeedBase(),
                    champion.attackSpeedGrowth(),
                    champion.movementSpeed(),
                    champion.attackRange(),
                    champion.patch()
                );
            }
        }

        System.out.println(
            "CSV exported successfully: " + outputPath
        );
    }
}