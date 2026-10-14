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
                "resource_type",

                "health_base",
                "health_growth",

                "mana_base",
                "mana_growth",

                "health_regen_base",
                "health_regen_growth",

                "mana_regen_base",
                "mana_regen_growth",

                "attack_damage_base",
                "attack_damage_growth",

                "armor_base",
                "armor_growth",

                "magic_resist_base",
                "magic_resist_growth",

                "attack_speed_base",
                "attack_speed_growth",

                "critical_strike_base",
                "critical_strike_growth",

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
                    champion.resourceType(),

                    champion.healthBase(),
                    champion.healthGrowth(),

                    champion.manaBase(),
                    champion.manaGrowth(),

                    champion.healthRegenBase(),
                    champion.healthRegenGrowth(),

                    champion.manaRegenBase(),
                    champion.manaRegenGrowth(),

                    champion.attackDamageBase(),
                    champion.attackDamageGrowth(),

                    champion.armorBase(),
                    champion.armorGrowth(),

                    champion.magicResistBase(),
                    champion.magicResistGrowth(),

                    champion.attackSpeedBase(),
                    champion.attackSpeedGrowth(),

                    champion.criticalStrikeBase(),
                    champion.criticalStrikeGrowth(),

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