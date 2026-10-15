package com.kazer0.leagueapi.repository;

import com.kazer0.leagueapi.model.Item;
import com.kazer0.leagueapi.model.ItemRecipe;
import com.kazer0.leagueapi.model.ItemEffect;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class ItemRepository {

    private final JdbcTemplate jdbcTemplate;

    public ItemRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Convert SQL numeric columns to nullable Java Doubles
    private Double getDouble(ResultSet rs, String column)
            throws SQLException {

        double value = rs.getDouble(column);
        return rs.wasNull() ? null : value;
    }

    private Integer getInteger(ResultSet rs, String column)
            throws SQLException {

        int value = rs.getInt(column);
        return rs.wasNull() ? null : value;
    }

    // Map one database row to an Item object
    private Item mapItem(ResultSet rs, int rowNum)
            throws SQLException {

        return new Item(
            rs.getInt("item_id"),
            rs.getString("item_name"),
            rs.getInt("gold_cost"),
            getInteger(rs, "sell_price"),

            getDouble(rs, "attack_damage"),
            getDouble(rs, "ability_power"),
            getDouble(rs, "health"),
            getDouble(rs, "mana"),
            getDouble(rs, "armor"),
            getDouble(rs, "magic_resist"),
            getDouble(rs, "attack_speed"),
            getDouble(rs, "critical_strike"),
            getDouble(rs, "movement_speed"),
            getDouble(rs, "ability_haste"),

            rs.getString("description_raw"),
            rs.getString("patch")
        );
    }

    // GET ALL ITEMS
    public List<Item> findAll() {

        String sql = """
            SELECT *
            FROM dbo.items
            ORDER BY item_name, item_id
            """;

        return jdbcTemplate.query(sql, this::mapItem);
    }

    // GET ITEM BY ID
    public Optional<Item> findById(int id) {

        String sql = """
            SELECT *
            FROM dbo.items
            WHERE item_id = ?
            """;

        List<Item> results = jdbcTemplate.query(
            sql,
            this::mapItem,
            id
        );

        return results.stream().findFirst();
    }

    // SEARCH ITEMS BY NAME
    public List<Item> searchByName(String name) {

        String sql = """
            SELECT *
            FROM dbo.items
            WHERE CHARINDEX(?, item_name) > 0
            ORDER BY item_name, item_id
            """;

        return jdbcTemplate.query(
            sql,
            this::mapItem,
            name
        );
    }

    // COUNT ITEMS
    public int count() {

        Integer result = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM dbo.items",
            Integer.class
        );

        return result == null ? 0 : result;
    }

    // GET AN ITEM'S BUILD COMPONENTS
    public List<ItemRecipe> findRecipesByItemId(int id) {

        String sql = """
            SELECT
                r.item_id,
                r.component_id,
                r.quantity,
                r.component_in_dataset,
                c.item_name AS component_name,
                r.patch
            FROM dbo.item_recipes r
            LEFT JOIN dbo.items c
                ON r.component_id = c.item_id
            WHERE r.item_id = ?
            ORDER BY r.component_id
            """;

        return jdbcTemplate.query(
            sql,
            (rs, rowNum) -> new ItemRecipe(
                rs.getInt("item_id"),
                rs.getInt("component_id"),
                getInteger(rs, "quantity"),
                rs.getBoolean("component_in_dataset"),
                rs.getString("component_name"),
                rs.getString("patch")
            ),
            id
        );
    }

    // GET AN ITEM'S PASSIVE EFFECTS
    public List<ItemEffect> findEffectsByItemId(int id) {

        String sql = """
            SELECT
                effect_id,
                item_id,
                effect_name,
                effect_description,
                patch
            FROM dbo.item_effects
            WHERE item_id = ?
            ORDER BY effect_id
            """;

        return jdbcTemplate.query(
            sql,
            (rs, rowNum) -> new ItemEffect(
                rs.getInt("effect_id"),
                rs.getInt("item_id"),
                rs.getString("effect_name"),
                rs.getString("effect_description"),
                rs.getString("patch")
            ),
            id
        );
    }
}