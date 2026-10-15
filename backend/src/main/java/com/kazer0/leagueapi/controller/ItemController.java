package com.kazer0.leagueapi.controller;

import com.kazer0.leagueapi.model.Item;
import com.kazer0.leagueapi.model.ItemRecipe;
import com.kazer0.leagueapi.model.ItemEffect;
import com.kazer0.leagueapi.repository.ItemRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository repository;

    public ItemController(ItemRepository repository) {
        this.repository = repository;
    }

    // GET /api/items/count
    @GetMapping("/count")
    public Map<String, Integer> countItems() {

        return Map.of(
            "totalItems",
            repository.count()
        );
    }

    // GET /api/items
    @GetMapping
    public List<Item> getAllItems() {

        return repository.findAll();
    }

    // GET /api/items/search?name=Trinity
    @GetMapping("/search")
    public List<Item> searchItems(
            @RequestParam String name
    ) {

        return repository.searchByName(name);
    }

    // GET /api/items/3078
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(
            @PathVariable int id
    ) {

        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() ->
                ResponseEntity.notFound().build()
            );
    }

    // GET /api/items/3078/recipes
    @GetMapping("/{id}/recipes")
    public ResponseEntity<List<ItemRecipe>> getRecipes(
            @PathVariable int id
    ) {

        if (repository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
            repository.findRecipesByItemId(id)
        );
    }

    // GET /api/items/3078/effects
    @GetMapping("/{id}/effects")
    public ResponseEntity<List<ItemEffect>> getEffects(
            @PathVariable int id
    ) {

        if (repository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
            repository.findEffectsByItemId(id)
        );
    }
}