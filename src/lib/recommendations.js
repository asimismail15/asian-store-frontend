const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "your", "this", "that", "made", "daily", "everyday"]);

function words(product) {
  return new Set(`${product?.title || ""} ${product?.category || ""} ${product?.brand || ""} ${product?.tags || ""}`.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) || []);
}

export function rankRecommendations(candidates, sources, viewedIds = [], limit = 4) {
  const sourceIds = new Set(sources.map((item) => String(item?._id || item?.id || "")));
  const viewed = new Set(viewedIds.map(String));
  const sourceWords = new Set(sources.flatMap((item) => [...words(item)]));
  const sourceCategories = new Set(sources.map((item) => String(item?.category || "").toLowerCase()).filter(Boolean));

  return candidates
    .filter((item) => item && !sourceIds.has(String(item._id || item.id || "")) && Number(item.stock ?? 1) > 0)
    .map((item) => {
      const itemWords = words(item);
      const sharedWords = [...itemWords].filter((word) => sourceWords.has(word)).length;
      const categoryMatch = sourceCategories.has(String(item.category || "").toLowerCase());
      const viewedMatch = viewed.has(String(item._id || item.id || ""));
      const rating = Math.min(5, Number(item.rating) || 0);
      const score = (categoryMatch ? 8 : 0) + sharedWords * 2 + (viewedMatch ? 3 : 0) + rating * 0.2;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title)))
    .slice(0, limit)
    .map(({ item }) => item);
}

export function rememberViewedProduct(id) {
  try {
    const key = "asian-store-viewed-products";
    const previous = JSON.parse(localStorage.getItem(key) || "[]");
    const next = [String(id), ...previous.filter((value) => String(value) !== String(id))].slice(0, 12);
    localStorage.setItem(key, JSON.stringify(next));
  } catch { /* Recommendations still work from the current page or cart. */ }
}

export function getViewedProductIds() {
  try {
    const value = JSON.parse(localStorage.getItem("asian-store-viewed-products") || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
