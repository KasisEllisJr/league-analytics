package com.kazer0.leagueapi.controller;

import com.kazer0.leagueapi.model.Champion;
import com.kazer0.leagueapi.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    // Rank champions by base health
    @GetMapping("/champions/top-health")
    public List<Champion> topHealth(
            @RequestParam(defaultValue = "10") int limit
    ) {
        validateLimit(limit);

        return analyticsService.topHealth(limit);
    }

    // Rank champions by base armor
    @GetMapping("/champions/top-armor")
    public List<Champion> topArmor(
            @RequestParam(defaultValue = "10") int limit
    ) {
        validateLimit(limit);

        return analyticsService.topArmor(limit);
    }

    // Calculate champion statistics at a level
    @GetMapping("/champions/{id}/level/{level}")
    public ResponseEntity<?> championAtLevel(
            @PathVariable int id,
            @PathVariable int level
    ) {
        if (level < 1 || level > 20) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "Level must be between 1 and 20"
                ));
        }

        return analyticsService.championAtLevel(id, level)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() ->
                ResponseEntity.notFound().build()
            );
    }

    // Compare two items
    @GetMapping("/items/compare")
    public ResponseEntity<?> compareItems(
            @RequestParam List<Integer> ids
    ) {
        if (ids.size() != 2
                || ids.get(0).equals(ids.get(1))) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error",
                    "Provide two different item IDs"
                ));
        }

        return analyticsService.compareItems(
                ids.get(0), ids.get(1))
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() ->
                ResponseEntity.notFound().build()
            );
    }

    private void validateLimit(int limit) {
        if (limit < 1 || limit > 100) {
            throw new IllegalArgumentException(
                "Limit must be between 1 and 100"
            );
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException ex
    ) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", ex.getMessage()));
    }
}