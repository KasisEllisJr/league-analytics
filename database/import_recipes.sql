eferenced five times.
    IF EXISTS (
        SELECT 1 FROM dbo.item_recipes_staging s
        LEFT JOIN dbo.items component ON component.item_id = TRY_CONVERT(INT, s.component_id)
        WHERE component.item_id IS NULL
          AND TRY_CONVERT(INT, s.component_id) <> 3867
    ) THROW 51009, 'Unexpected missing recipe component ID.', 1;

    INSERT INTO dbo.item_recipes
        (item_id, component_id, quantity, component_in_dataset, patch)
    SELECT
        CONVERT(INT, item_id),
        CONVERT(INT, component_id),
        CONVERT(INT, quantity),
        CASE WHEN LOWER(TRIM(component_in_dataset)) IN (N'true', N'1') THEN 1 ELSE 0 END,
        CONVERT(VARCHAR(20), TRIM(patch))
    FROM dbo.item_recipes_staging;

    IF (SELECT COUNT(*) FROM dbo.item_recipes) <> 409
        THROW 51010, 'Final recipe row count is not 409.', 1;

    COMMIT TRANSACTION;
    PRINT 'Success: 409 item recipe relationships loaded.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

SELECT COUNT(*) AS total_recipes FROM dbo.item_recipes;
SELECT item_id, component_id, quantity, component_in_dataset
FROM dbo.item_recipes WHERE component_id = 3867 ORDER BY item_id;