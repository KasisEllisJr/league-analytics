import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Coins,
  GitBranch,
  Sparkles,
  GitCompareArrows,
} from "lucide-react";

import { itemApi } from "../services/api";
import ItemImage from "../components/ItemImage";

const ITEM_STATS = [
  ["Attack Damage", "attackDamage"],
  ["Ability Power", "abilityPower"],
  ["Health", "health"],
  ["Mana", "mana"],
  ["Armor", "armor"],
  ["Magic Resistance", "magicResist"],
  ["Attack Speed", "attackSpeed"],
  ["Critical Strike", "criticalStrike"],
  ["Movement Speed", "movementSpeed"],
  ["Ability Haste", "abilityHaste"],
];

function formatValue(value) {
  return value == null
    ? "—"
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
}

function ItemDetails() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [effects, setEffects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItemDetails() {
      setLoading(true);
      setError(null);
      setItem(null);
      setRecipes([]);
      setEffects([]);

      try {
        const [itemData, recipeData, effectData] =
          await Promise.all([
            itemApi.getById(id),
            itemApi.getRecipes(id),
            itemApi.getEffects(id),
          ]);

        if (!cancelled) {
          setItem(itemData);
          setRecipes(recipeData);
          setEffects(effectData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.status === 404
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItemDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p role="status">Loading item details...</p>;
  }

  if (error) {
    return (
      <section className="dashboard-panel">
        <p className="error-message" role="alert">
          {error}
        </p>

        <Link to="/items" className="back-link">
          <ArrowLeft size={16} />
          Back to Item Explorer
        </Link>
      </section>
    );
  }

  if (!item) {
    return null;
  }

  const availableStats = ITEM_STATS.filter(
    ([, key]) => item[key] != null
  );

  return (
    <>
      <Link to="/items" className="back-link">
        <ArrowLeft size={17} />
        Back to Item Explorer
      </Link>

      <header className="page-header">
        <div className="item-profile-identity">
          <div className="item-profile-artwork">
            <ItemImage
              itemId={item.itemId}
              name={item.itemName}
              className="item-profile-icon"
            />
          </div>

          <div>
            <p className="eyebrow">
              ITEM COLLECTION / EQUIPMENT
            </p>

            <h1>{item.itemName}</h1>

            <p className="subtitle">
              Item #{item.itemId} · Patch {item.patch}
            </p>
          </div>
        </div>

        <Link
          className="compare-link-button"
          to={`/items/compare?first=${item.itemId}`}
        >
          <GitCompareArrows size={17} />
          Compare Item
        </Link>
      </header>

      <section className="item-summary-grid">
        <article className="stat-card">
          <div className="stat-icon">
            <Coins size={24} />
          </div>

          <p className="stat-label">PURCHASE COST</p>
          <h2>{formatValue(item.goldCost)}</h2>
          <p className="stat-description">Gold</p>
        </article>

        <article className="stat-card">
          <div className="stat-icon">
            <Coins size={24} />
          </div>

          <p className="stat-label">SELL PRICE</p>
          <h2>{formatValue(item.sellPrice)}</h2>
          <p className="stat-description">Gold</p>
        </article>
      </section>

      <section className="dashboard-panel">
        <h2>Item Statistics</h2>

        {availableStats.length === 0 ? (
          <p>
            No structured item statistics are available.
          </p>
        ) : (
          <div className="item-stats-grid">
            {availableStats.map(([label, key]) => (
              <div className="item-stat-box" key={key}>
                <span>{label}</span>
                <strong>{formatValue(item[key])}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="item-section-title">
          <GitBranch size={21} />
          <h2>Build Components</h2>
        </div>

        {recipes.length === 0 ? (
          <p>
            No component recipe was recorded for this item.
          </p>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <div
                className="recipe-card"
                key={`${recipe.componentId}-${index}`}
              >
                <div>
                  <strong>
                    {recipe.componentName ??
                      `Component #${recipe.componentId}`}
                  </strong>

                  <p>
                    Component ID: {recipe.componentId}
                  </p>
                </div>

                <span className="recipe-quantity">
                  ×{recipe.quantity ?? 1}
                </span>

                {recipe.componentInDataset ? (
                  <Link
                    className="details-link"
                    to={`/items/${recipe.componentId}`}
                  >
                    View Component
                  </Link>
                ) : (
                  <span className="missing-component">
                    Not in item dataset
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="chart-note">
          Recipes display relationships preserved by
          your Java importer. Some intermediate
          components may be absent from the main dataset.
        </p>
      </section>

      <section className="dashboard-panel">
        <div className="item-section-title">
          <Sparkles size={21} />
          <h2>Passive and Special Effects</h2>
        </div>

        {effects.length === 0 ? (
          <p>
            No extracted passive effects are available
            for this item.
          </p>
        ) : (
          <div className="effects-list">
            {effects.map((effect) => (
              <article
                className="effect-card"
                key={effect.effectId}
              >
                <h3>
                  {effect.effectName ||
                    "Unnamed Effect"}
                </h3>

                <p>
                  {effect.effectDescription ||
                    "No description available."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {item.descriptionRaw && (
        <section className="dashboard-panel">
          <h2>Source Description</h2>

          <p className="source-description">
            {item.descriptionRaw}
          </p>
        </section>
      )}
    </>
  );
}

export default ItemDetails;