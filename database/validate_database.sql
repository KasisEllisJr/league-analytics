USE league_analytics;
GO

SELECT N'Champions' AS dataset, COUNT(*) AS actual_rows, 173 AS expected_rows FROM dbo.champions
UNION ALL SELECT N'Items', COUNT(*), 253 FROM dbo.items
UNION ALL SELECT N'Item recipes', COUNT(*), 409 FROM dbo.item_recipes
UNION ALL SELECT N'Item effects', COUNT(*), 242 FROM dbo.item_effects;

SELECT N'Orphaned recipe parents' AS check_name, COUNT(*) AS problem_count
FROM dbo.item_recipes r LEFT JOIN dbo.items i ON i.item_id = r.item_id WHERE i.item_id IS NULL
UNION ALL
SELECT N'Orphaned effect parents', COUNT(*)
FROM dbo.item_effects e LEFT JOIN dbo.items i ON i.item_id = e.item_id WHERE i.item_id IS NULL;

SELECT r.component_id, COUNT(*) AS missing_component_references
FROM dbo.item_recipes r
LEFT JOIN dbo.items i ON i.item_id = r.component_id
WHERE i.item_id IS NULL
GROUP BY r.component_id
ORDER BY r.component_id;

SELECT COUNT(*) AS incorrect_component_flag_count
FROM dbo.item_recipes r
LEFT JOIN dbo.items i ON i.item_id = r.component_id
WHERE r.component_in_dataset <> CASE WHEN i.item_id IS NULL THEN 0 ELSE 1 END;

SELECT N'Champions' AS dataset, COUNT(*) AS invalid_patch_count FROM dbo.champions WHERE patch <> '26.20'
UNION ALL SELECT N'Items', COUNT(*) FROM dbo.items WHERE patch <> '26.20'
UNION ALL SELECT N'Item recipes', COUNT(*) FROM dbo.item_recipes WHERE patch <> '26.20'
UNION ALL SELECT N'Item effects', COUNT(*) FROM dbo.item_effects WHERE patch <> '26.20';

SELECT N'Blank champion names' AS check_name, COUNT(*) AS problem_count FROM dbo.champions WHERE NULLIF(TRIM(champion_name), N'') IS NULL
UNION ALL SELECT N'Blank item names', COUNT(*) FROM dbo.items WHERE NULLIF(TRIM(item_name), N'') IS NULL
UNION ALL SELECT N'Negative item prices', COUNT(*) FROM dbo.items WHERE gold_cost < 0 OR sell_price < 0
UNION ALL SELECT N'Invalid recipe quantities', COUNT(*) FROM dbo.item_recipes WHERE quantity <= 0
UNION ALL SELECT N'Blank effect names/descriptions', COUNT(*) FROM dbo.item_effects WHERE NULLIF(TRIM(effect_name), N'') IS NULL OR NULLIF(TRIM(effect_description), N'') IS NULL;

DECLARE @count_ok BIT = CASE WHEN
    (SELECT COUNT(*) FROM dbo.champions) = 173 AND
    (SELECT COUNT(*) FROM dbo.items) = 253 AND
    (SELECT COUNT(*) FROM dbo.item_recipes) = 409 AND
    (SELECT COUNT(*) FROM dbo.item_effects) = 242
    THEN 1 ELSE 0 END;
DECLARE @orphans INT =
    (SELECT COUNT(*) FROM dbo.item_recipes r LEFT JOIN dbo.items i ON i.item_id = r.item_id WHERE i.item_id IS NULL) +
    (SELECT COUNT(*) FROM dbo.item_effects e LEFT JOIN dbo.items i ON i.item_id = e.item_id WHERE i.item_id IS NULL);
DECLARE @unexpected_components INT =
    (SELECT COUNT(*) FROM dbo.item_recipes r LEFT JOIN dbo.items i ON i.item_id = r.component_id WHERE i.item_id IS NULL AND r.component_id <> 3867);
DECLARE @known_component_count INT =
    (SELECT COUNT(*) FROM dbo.item_recipes r LEFT JOIN dbo.items i ON i.item_id = r.component_id WHERE i.item_id IS NULL AND r.component_id = 3867);
DECLARE @bad_flags INT =
    (SELECT COUNT(*) FROM dbo.item_recipes r LEFT JOIN dbo.items i ON i.item_id = r.component_id
     WHERE r.component_in_dataset <> CASE WHEN i.item_id IS NULL THEN 0 ELSE 1 END);
DECLARE @bad_patches INT =
    (SELECT COUNT(*) FROM dbo.champions WHERE patch <> '26.20') +
    (SELECT COUNT(*) FROM dbo.items WHERE patch <> '26.20') +
    (SELECT COUNT(*) FROM dbo.item_recipes WHERE patch <> '26.20') +
    (SELECT COUNT(*) FROM dbo.item_effects WHERE patch <> '26.20');
DECLARE @bad_fields INT =
    (SELECT COUNT(*) FROM dbo.champions WHERE NULLIF(TRIM(champion_name), N'') IS NULL) +
    (SELECT COUNT(*) FROM dbo.items WHERE NULLIF(TRIM(item_name), N'') IS NULL OR gold_cost < 0 OR sell_price < 0) +
    (SELECT COUNT(*) FROM dbo.item_recipes WHERE quantity <= 0) +
    (SELECT COUNT(*) FROM dbo.item_effects WHERE NULLIF(TRIM(effect_name), N'') IS NULL OR NULLIF(TRIM(effect_description), N'') IS NULL);

SELECT CASE WHEN @count_ok = 1 AND @orphans = 0 AND @unexpected_components = 0
                 AND @known_component_count = 5 AND @bad_flags = 0 AND @bad_patches = 0 AND @bad_fields = 0
            THEN 'PASS (structural checks; known 3867 exception accepted)'
            ELSE 'REVIEW REQUIRED' END AS validation_result,
       @orphans AS orphan_parent_count,
       @known_component_count AS accepted_3867_references,
       @unexpected_components AS unexpected_missing_components,
       @bad_flags AS invalid_component_flags,
       @bad_patches AS invalid_patch_rows,
       @bad_fields AS invalid_field_rows;