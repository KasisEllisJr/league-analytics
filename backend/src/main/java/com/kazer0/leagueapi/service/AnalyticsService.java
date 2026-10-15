package com.kazer0.leagueapi.service;

import com.kazer0.leagueapi.model.Champion;
import com.kazer0.leagueapi.model.Item;
import com.kazer0.leagueapi.repository.ChampionRepository;
import com.kazer0.leagueapi.repository.ItemRepository;

import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnalyticsService {

    private final ChampionRepository championRepository;
    private final ItemRepository itemRepository;

    public AnalyticsService(
            ChampionRepository championRepository,
            ItemRepository itemRepository
    ) {
        this.championRepository = championRepository;
        this.itemRepository = itemRepository;
    }

    // Calculate standard champion stat growth
    public double calculateStat(
            double base,
            double growth,
            int level
    ) {
        return ChampionStatCalculator.calculate(
            base, growth, level
            );
        }

    // Rank champions by base health
    public List<Champion> topHealth(int limit) {

        return championRepository.findAll()
            .stream()
            .filter(c -> c.healthBase() != null)
            .sorted(
                Comparator.comparingDouble(
                    (Champion c) -> c.healthBase()
                ).reversed()
            )
            .limit(limit)
            .toList();
    }

    // Rank champions by base armor
    public List<Champion> topArmor(int limit) {

        return championRepository.findAll()
            .stream()
            .filter(c -> c.armorBase() != null)
            .sorted(
                Comparator.comparingDouble(
                    (Champion c) -> c.armorBase()
                ).reversed()
            )
            .limit(limit)
            .toList();
    }

    // Calculate champion statistics at a requested level
    public Optional<Map<String, Object>> championAtLevel(
            int championId,
            int level
    ) {

        if (level < 1 || level > ChampionStatCalculator.MAX_LEVEL) {
            throw new IllegalArgumentException(
                "Level must be between 1 and 20."
            );
        }

        return championRepository.findById(championId)
            .map(champion -> {

                Map<String, Object> result =
                    new LinkedHashMap<>();

                result.put("championId",
                    champion.championId());

                result.put("championName",
                    champion.championName());

                result.put("level", level);
                result.put("patch", champion.patch());

                result.put("health",
                    scaledStat(
                        champion.healthBase(),
                        champion.healthGrowth(),
                        level
                    )
                );

                result.put("attackDamage",
                    scaledStat(
                        champion.attackDamageBase(),
                        champion.attackDamageGrowth(),
                        level
                    )
                );

                result.put("armor",
                    scaledStat(
                        champion.armorBase(),
                        champion.armorGrowth(),
                        level
                    )
                );

                result.put("magicResist",
                    scaledStat(
                        champion.magicResistBase(),
                        champion.magicResistGrowth(),
                        level
                    )
                );

                result.put("resourceType",
                    champion.resourceType());

                result.put("resourcePoints",
                    scaledStat(
                        champion.manaBase(),
                        champion.manaGrowth(),
                        level
                    )
                );

                result.put("calculationType",
                    "Standard stat-growth estimate");

                return result;
            });
    }

    private Double scaledStat(
            Double base,
            Double growth,
            int level
    ) {
        if (base == null || growth == null) {
            return null;
        }

        return Math.round(
            calculateStat(base, growth, level) * 100.0
        ) / 100.0;
    }

    // Retrieve two items for side-by-side comparison
    public Optional<Map<String, Object>> compareItems(
            int firstId,
            int secondId
    ) {

        Optional<Item> first =
            itemRepository.findById(firstId);

        Optional<Item> second =
            itemRepository.findById(secondId);

        if (first.isEmpty() || second.isEmpty()) {
            return Optional.empty();
        }

        Map<String, Object> comparison =
            new LinkedHashMap<>();

        comparison.put("firstItem", first.get());
        comparison.put("secondItem", second.get());

        comparison.put("goldCostDifference",
            first.get().goldCost()
            - second.get().goldCost());

        return Optional.of(comparison);
    }
}