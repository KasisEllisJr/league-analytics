package com.kazer0.leagueapi.repository;

import com.kazer0.leagueapi.model.Champion;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class ChampionRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChampionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private Champion mapChampion(ResultSet rs, int rowNum)
            throws SQLException {

        return new Champion(
            rs.getInt("champion_id"),
            rs.getString("champion_name"),
            rs.getString("roles"),
            rs.getString("resource_type"),

            getDouble(rs, "health_base"),
            getDouble(rs, "health_growth"),
            getDouble(rs, "mana_base"),
            getDouble(rs, "mana_growth"),

            getDouble(rs, "health_regen_base"),
            getDouble(rs, "health_regen_growth"),
            getDouble(rs, "mana_regen_base"),
            getDouble(rs, "mana_regen_growth"),

            getDouble(rs, "attack_damage_base"),
            getDouble(rs, "attack_damage_growth"),
            getDouble(rs, "armor_base"),
            getDouble(rs, "armor_growth"),
            getDouble(rs, "magic_resist_base"),
            getDouble(rs, "magic_resist_growth"),

            getDouble(rs, "attack_speed_base"),
            getDouble(rs, "attack_speed_growth"),
            getDouble(rs, "critical_strike_base"),
            getDouble(rs, "critical_strike_growth"),

            getDouble(rs, "movement_speed"),
            getDouble(rs, "attack_range"),
            rs.getString("patch")
        );
    }

    private Double getDouble(ResultSet rs, String column)
            throws SQLException {

        double value = rs.getDouble(column);
        return rs.wasNull() ? null : value;
    }

    public List<Champion> findAll() {

        String sql = """
            SELECT *
            FROM dbo.champions
            ORDER BY champion_name
            """;

        return jdbcTemplate.query(sql, this::mapChampion);
    }

    public Optional<Champion> findById(int id) {

        String sql = """
            SELECT *
            FROM dbo.champions
            WHERE champion_id = ?
            """;

        List<Champion> results =
            jdbcTemplate.query(sql, this::mapChampion, id);

        return results.stream().findFirst();
    }

    public List<Champion> searchByName(String name) {

        String sql = """
            SELECT *
            FROM dbo.champions
            WHERE champion_name LIKE ?
            ORDER BY champion_name
            """;

        String escaped = name
            .replace("~", "~~")
            .replace("%", "~%")
            .replace("_", "~_")
            .replace("[", "~[");

        // Use SQL Server LIKE escaping for literal searches.
        String search = "%" + escaped + "%";

        return jdbcTemplate.query(
            sql.replace(
                "LIKE ?",
                "LIKE ? ESCAPE '~'"
            ),
            this::mapChampion,
            search
        );
    }

    public int count() {

        Integer result = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM dbo.champions",
            Integer.class
        );

        return result == null ? 0 : result;
    }
}