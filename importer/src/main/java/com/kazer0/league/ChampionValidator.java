package com.kazer0.league;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ChampionValidator {

    public static void validate(List<Champion> champions) {

        if (champions.isEmpty()) {
            throw new IllegalStateException(
                "No champions to validate."
            );
        }

        Set<Integer> championIds = new HashSet<>();
        Set<String> championNames = new HashSet<>();

        for (Champion champion : champions) {

            String name = champion.championName();

            if (champion.championId() <= 0) {
                throw new IllegalStateException(
                    "Invalid champion ID: " + name
                );
            }

            if (!championIds.add(champion.championId())) {
                throw new IllegalStateException(
                    "Duplicate champion ID: "
                    + champion.championId()
                );
            }

            if (!championNames.add(name)) {
                throw new IllegalStateException(
                    "Duplicate champion name: " + name
                );
            }

            if (name.isBlank()) {
                throw new IllegalStateException(
                    "Champion name is missing."
                );
            }

            if (champion.roles().isBlank()) {
                throw new IllegalStateException(
                    "Missing roles for " + name
                );
            }

            /*if (champion.resourceType().isBlank()) {
                throw new IllegalStateException(
                    "Missing resource type for " + name
                );
            }*/

            checkPositive(name, "Health",
                    champion.healthBase());

            checkPositive(name, "Attack damage",
                    champion.attackDamageBase());

            checkPositive(name, "Attack speed",
                    champion.attackSpeedBase());

            checkNonNegative(name, "Mana/resource",
                    champion.manaBase());

            checkNonNegative(name, "Health regen",
                    champion.healthRegenBase());

            checkNonNegative(name, "Mana/resource regen",
                    champion.manaRegenBase());

            checkPositive(name, "Movement speed",
                    champion.movementSpeed());

            checkNonNegative(name, "Attack range",
                    champion.attackRange());

            if (!"26.20".equals(champion.patch())) {
                throw new IllegalStateException(
                    "Unexpected patch for " + name
                );
            }
        }

        System.out.println(
            "Validation passed: "
            + champions.size() + " champions."
        );
    }

    private static void checkPositive(
            String champion,
            String stat,
            double value
    ) {
        if (!Double.isFinite(value) || value <= 0) {
            throw new IllegalStateException(
                "Invalid " + stat + " for " + champion
            );
        }
    }

    private static void checkNonNegative(
            String champion,
            String stat,
            double value
    ) {
        if (!Double.isFinite(value) || value < 0) {
            throw new IllegalStateException(
                "Invalid " + stat + " for " + champion
            );
        }
    }
}