
USE league_analytics;
GO

-- ====================================
-- CHAMPION TABLE
-- ====================================

CREATE TABLE dbo.champions (
    champion_id INT PRIMARY KEY,
    champion_name NVARCHAR(100) NOT NULL,
    roles NVARCHAR(150),
    resource_type NVARCHAR(50),

    health_base FLOAT,
    health_growth FLOAT,

    mana_base FLOAT,
    mana_growth FLOAT,

    health_regen_base FLOAT,
    health_regen_growth FLOAT,

    mana_regen_base FLOAT,
    mana_regen_growth FLOAT,

    attack_damage_base FLOAT,
    attack_damage_growth FLOAT,

    armor_base FLOAT,
    armor_growth FLOAT,

    magic_resist_base FLOAT,
    magic_resist_growth FLOAT,

    attack_speed_base FLOAT,
    attack_speed_growth FLOAT,

    critical_strike_base FLOAT,
    critical_strike_growth FLOAT,

    movement_speed FLOAT,
    attack_range FLOAT,

    patch VARCHAR(20) NOT NULL
);
GO

-- ====================================
-- ITEM TABLE
-- ====================================

CREATE TABLE dbo.items (
    item_id INT PRIMARY KEY,
    item_name NVARCHAR(200) NOT NULL,

    gold_cost INT NOT NULL,
    sell_price INT,

    attack_damage FLOAT NULL,
    ability_power FLOAT NULL,
    health FLOAT NULL,
    mana FLOAT NULL,
    armor FLOAT NULL,
    magic_resist FLOAT NULL,
    attack_speed FLOAT NULL,
    critical_strike FLOAT NULL,
    movement_speed FLOAT NULL,
    ability_haste FLOAT NULL,

    description_raw NVARCHAR(MAX),
    patch VARCHAR(20) NOT NULL
);
GO

-- ====================================
-- ITEM RECIPES TABLE
-- ====================================

CREATE TABLE dbo.item_recipes (
    item_id INT NOT NULL,
    component_id INT NOT NULL,
    quantity INT NOT NULL,
    component_in_dataset BIT NOT NULL,
    patch VARCHAR(20) NOT NULL,

    CONSTRAINT PK_item_recipes
        PRIMARY KEY (item_id, component_id),

    CONSTRAINT FK_item_recipes_items
        FOREIGN KEY (item_id)
        REFERENCES dbo.items(item_id),

    CONSTRAINT CK_recipe_quantity
        CHECK (quantity > 0)
);
GO

-- ====================================
-- ITEM EFFECTS TABLE
-- ====================================

CREATE TABLE dbo.item_effects (
    effect_id INT IDENTITY(1,1) PRIMARY KEY,

    item_id INT NOT NULL,
    effect_name NVARCHAR(200) NOT NULL,
    effect_description NVARCHAR(MAX),
    patch VARCHAR(20) NOT NULL,

    CONSTRAINT FK_item_effects_items
        FOREIGN KEY (item_id)
        REFERENCES dbo.items(item_id)
);
GO

-- ====================================
-- INDEXES
-- ====================================

CREATE INDEX IX_champions_name
ON dbo.champions(champion_name);

CREATE INDEX IX_items_name
ON dbo.items(item_name);

CREATE INDEX IX_items_gold_cost
ON dbo.items(gold_cost);

CREATE INDEX IX_item_recipes_component
ON dbo.item_recipes(component_id);

CREATE INDEX IX_item_effects_item_id
ON dbo.item_effects(item_id);
GO
