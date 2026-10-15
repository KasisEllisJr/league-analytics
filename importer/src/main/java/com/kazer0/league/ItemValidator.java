package com.kazer0.league;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ItemValidator {

    public static void validate(List<Item> items) {

        if (items.isEmpty()) {
            throw new IllegalStateException(
                "No items were collected."
            );
        }

        Set<Integer> itemIds = new HashSet<>();

        for (Item item : items) {

            if (item.itemId() <= 0) {
                throw new IllegalStateException(
                    "Invalid item ID: " + item.itemId()
                );
            }

            if (!itemIds.add(item.itemId())) {
                throw new IllegalStateException(
                    "Duplicate item ID: " + item.itemId()
                );
            }

            if (item.itemName().isBlank()) {
                throw new IllegalStateException(
                    "Item name is missing: " + item.itemId()
                );
            }

            if (item.goldCost() < 0) {
                throw new IllegalStateException(
                    "Invalid gold cost: " + item.itemName()
                );
            }

            if (item.sellPrice() < 0) {
                throw new IllegalStateException(
                    "Invalid sell price: " + item.itemName()
                );
            }

            if (!"26.20".equals(item.patch())) {
                throw new IllegalStateException(
                    "Unexpected patch: " + item.itemName()
                );
            }
        }

        System.out.println(
            "Item validation passed: "
            + items.size() + " items."
        );
    }
}