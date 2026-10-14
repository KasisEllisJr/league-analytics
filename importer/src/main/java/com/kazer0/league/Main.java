package com.kazer0.league;

import java.nio.file.Path;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        try {
            System.out.println("Starting League Analytics...");

            System.out.println("Fetching champion data...");
            String json = DataDragonClient.fetchChampions();

            System.out.println("Parsing champions...");
            List<Champion> champions =
                    ChampionParser.parseChampions(json);
                    
            ChampionValidator.validate(champions);

            if (champions.isEmpty()) {
                throw new IllegalStateException(
                    "No champions were found."
                );
            }

            System.out.println(
                "Champions processed: " + champions.size()
            );

            Path outputPath = Path.of(
                "..", "datasets", "patch-26.20",
                "champions.csv"
            ).toAbsolutePath().normalize();

            ChampionCsvExporter.export(
                champions,
                outputPath
            );

            System.out.println(
                "League Analytics import completed!"
            );

        } catch (Exception e) {
            System.err.println(
                "Import failed: " + e.getMessage()
            );
            e.printStackTrace();
        }
    }
}