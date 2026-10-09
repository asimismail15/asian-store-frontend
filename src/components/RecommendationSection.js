"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { productApi } from "@/lib/api";
import { getViewedProductIds, rankRecommendations } from "@/lib/recommendations";

export default function RecommendationSection({ sources = [], title = "You might also like" }) {
  const [catalog, setCatalog] = useState([]);
  const [viewedIds, setViewedIds] = useState([]);
  const sourceKey = sources.map((item) => item?._id || item?.id).filter(Boolean).join(",");
  const categories = [...new Set(sources.map((item) => item?.category).filter(Boolean))];
  const categoryKey = categories.join(",");
  const recommendations = useMemo(() => rankRecommendations(catalog, sources, viewedIds), [catalog, sources, viewedIds]);

  useEffect(() => {
    let active = true;
    const selectedCategories = categoryKey ? categoryKey.split(",").slice(0, 3) : [""];
    Promise.all(selectedCategories.map(async (category) => {
      const first = await productApi.list({ ...(category ? { category } : {}), page: 1 });
      const products = first.products || [];
      if (first.pages > 1) {
        const second = await productApi.list({ ...(category ? { category } : {}), page: 2 });
        products.push(...(second.products || []));
      }
      return products;
    })).then((groups) => {
      if (active) {
        setViewedIds(getViewedProductIds());
        setCatalog([...new Map(groups.flat().map((item) => [String(item._id || item.id), item])).values()]);
      }
    }).catch(() => { if (active) { setViewedIds(getViewedProductIds()); setCatalog([]); } });
    return () => { active = false; };
  }, [categoryKey, sourceKey]);

  if (!sources.length || !recommendations.length) return null;
  return <section className="mt-16 border-t border-black/10 pt-10 dark:border-white/15 sm:mt-20" aria-labelledby="recommendation-title">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-700 dark:text-violet-300">CURATED FOR YOU</p><h2 id="recommendation-title" className="mt-2 text-2xl font-bold">{title}</h2></div><p className="max-w-sm text-xs text-black/55 dark:text-white/60">Picked using product categories, shared details, and your recent browsing.</p></div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map((product, index) => <div key={product._id || product.id} className="recommendation-enter" style={{ animationDelay: `${index * 70}ms` }}><ProductCard product={product}/></div>)}</div>
  </section>;
}
