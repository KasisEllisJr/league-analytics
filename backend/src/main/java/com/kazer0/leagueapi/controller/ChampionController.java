package com.kazer0.leagueapi.controller;

import com.kazer0.leagueapi.model.Champion;
import com.kazer0.leagueapi.repository.ChampionRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/champions")
public class ChampionController {

    private final ChampionRepository repository;

    public ChampionController(ChampionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/count")
    public Map<String, Integer> countChampions() {
        return Map.of(
            "totalChampions",
            repository.count()
        );
    }

    @GetMapping
    public List<Champion> getAllChampions() {
        return repository.findAll();
    }

    @GetMapping("/search")
    public List<Champion> searchChampions(
            @RequestParam String name
    ) {
        return repository.searchByName(name);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Champion> getChampionById(
            @PathVariable int id
    ) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() ->
                ResponseEntity.notFound().build()
            );
    }
}