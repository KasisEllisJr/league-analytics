USE league_analytics;
GO

IF OBJECT_ID(N'dbo.item_effects_staging', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.item_effects_staging (
        item_id NVARCHAR(50) NULL,
        effect_name NVARCHAR(MAX) NULL,
        effect_description NVARCHAR(MAX) NULL,
        patch NVARCHAR(20) NULL
    );
END;
GO

IF (SELECT COUNT(*) FROM dbo.items) <> 253
    THROW 52001, 'Expected 253 rows in dbo.items before importing effects.', 1;
IF EXISTS (SELECT 1 FROM dbo.item_effects)
    THROW 52002, 'dbo.item_effects is not empty. Import stopped to avoid duplicates.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.item_effects_staging)
BEGIN
    BULK INSERT dbo.item_effects_staging
    FROM 'G:\Personal\Portfolio\league-analytics\datasets\patch-26.20\item_effects.csv'
    WITH (
        FORMAT = 'CSV',
        FIRSTROW = 2,
        FIELDQUOTE = '"',
        CODEPAGE = '65001',
        TABLOCK
    );
END;
GO

SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF (SELECT COUNT(*) FROM dbo.item_effects_staging) <> 242
        THROW 52003, 'Expected 242 staged effect rows.', 1;
    IF EXISTS (SELECT 1 FROM dbo.item_effects)
        THROW 52004, 'dbo.item_effects already has records.', 1;

    IF EXISTS (
        SELECT 1 FROM dbo.item_effects_staging s
        WHERE TRY_CONVERT(INT, s.item_id) IS NULL
           OR TRY_CONVERT(INT, s.item_id) <= 0
           OR NULLIF(TRIM(s.effect_name), N'') IS NULL
           OR NULLIF(TRIM(s.effect_description), N'') IS NULL
           OR LEN(TRIM(s.effect_name)) > 200
           OR s.patch IS NULL
           OR TRIM(s.patch) <> N'26.20'
    ) THROW 52005, 'Invalid effect ID, name, description, or patch.', 1;

    IF EXISTS (
        SELECT 1 FROM dbo.item_effects_staging s
        LEFT JOIN dbo.items i ON i.item_id = TRY_CONVERT(INT, s.item_id)
        WHERE i.item_id IS NULL
    ) THROW 52006, 'An effect references an item missing from dbo.items.', 1;

    INSERT INTO dbo.item_effects
        (item_id, effect_name, effect_description, patch)
    SELECT
        CONVERT(INT, s.item_id),
        TRIM(s.effect_name),
        TRIM(s.effect_description),
        CONVERT(VARCHAR(20), TRIM(s.patch))
    FROM dbo.item_effects_staging s;

    IF (SELECT COUNT(*) FROM dbo.item_effects) <> 242
        THROW 52007, 'Final effect row count is not 242.', 1;

    COMMIT TRANSACTION;
    PRINT 'Success: 242 item effects loaded.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

SELECT COUNT(*) AS total_effects FROM dbo.item_effects;
SELECT i.item_name, e.effect_name, e.effect_description
FROM dbo.item_effects e
JOIN dbo.items i ON i.item_id = e.item_id
WHERE i.item_name = N'Trinity Force';