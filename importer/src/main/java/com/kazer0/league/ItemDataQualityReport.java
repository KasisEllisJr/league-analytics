package com.kazer0.league;

import java.util.List;
import java.util.function.Function;

public class ItemDataQualityReport {

    public static void generate(List<Item> items) {

        System.out.println("\n============================");
        System.out.println("ITEM DATA QUALITY REPORT");
        System.out.println("============================");

        System.out.println("Total items: " + items.size());

        checkStat(items, "Attack Damage", Item::attackDamage);
        checkStat(items, "Ability Power", Item::abilityPower);
        checkStat(items, "Health", Item::health);
        checkStat(items, "Mana", Item::mana);
        checkStat(items, "Armor", Item::armor);
        checkStat(items, "Magic Resist", Item::magicResist);
        checkStat(items, "Attack Speed", Item::attackSpeed);
        checkStat(items, "Critical Strike", Item::criticalStrike);
        checkStat(items, "Movement Speed", Item::movementSpeed);

        System.out.println("============================");
    }

    private static void checkStat(
            List<Item> items,
            String statName,
            Function<Item, Double> getter
    ) {

        long available = items.stream()
                .filter(item -> getter.apply(item) != null)
                .count();

        long unavailable = items.size() - available;

        System.out.printf(
            "%-20s Available: %-4d Missing: %d%n",
            statName,
            available,
            unavailable
        );
    }
}