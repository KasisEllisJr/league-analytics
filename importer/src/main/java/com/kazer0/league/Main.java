package com.kazer0.league;

public class Main {

    public static void main(String[] args) {

        try {
            System.out.println("Fetching champion data...");

            String json = DataDragonClient.fetchChampions();

            ChampionParser.printAllChampions(json);

            System.out.println(
                    "\nAll champion data retrieved successfully!"
            );

        } catch (Exception e) {
            System.err.println(
                    "Failed to retrieve champion data: "
                    + e.getMessage()
            );
            e.printStackTrace();
        }
    }
}