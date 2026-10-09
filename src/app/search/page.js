"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { productApi } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductSkeletonGrid from "@/components/ProductSkeletonGrid";

import { demoCategories as categories } from "@/lib/demoProducts";

function SearchPageContent() {
  const params = useSearchParams();
  const routeQuery = params.get("q") || "";
  const [query, setQuery] = useState(routeQuery);
  useEffect(() => { Promise.resolve().then(() => setQuery(routeQuery)); }, [routeQuery]);
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    productApi.listAll().then((items) => { if (active) setProducts(items); })
      .catch((reason) => { if (active) setError(reason.message || "We couldn't load the collection."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !term || `${product.title} ${product.category} ${product.description || ""}`.toLowerCase().includes(term);
      const matchesCategory = !category || (category === "Luxury Watches"
        ? /watch|timepiece/i.test(`${product.title} ${product.category}`)
        : category === "Home Decor"
          ? /home|living|decor|kitchen/i.test(product.category || "")
          : (product.category || "").toLowerCase().includes(category.toLowerCase()));
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  return <main className="min-h-[75vh] bg-white px-5 py-12 text-black dark:bg-black dark:text-white sm:px-10 sm:py-16">
    <div className="mx-auto max-w-7xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-[10px] tracking-[.28em] text-[#6d28d9]">THE ASIAN EDIT</p><h1 className="mt-3 font-serif text-4xl sm:text-6xl">Find your next favourite.</h1><p className="mt-3 text-sm text-black/65 dark:text-white/65">Thoughtful pieces, selected for you.</p></div>
        <Link href="/shop" className="lux-interactive inline-flex items-center gap-2 text-xs tracking-[.14em] text-violet-700 dark:text-violet-300">BROWSE ALL <ArrowRight size={14}/></Link>
      </div>
      <label className="lux-search-field flex items-center gap-3 border-b border-black/20 dark:border-white/20 py-4 focus-within:border-[#6d28d9]"><Search className="text-[#6d28d9]" size={20}/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-black/50 dark:placeholder:text-white/45 dark:text-white sm:text-2xl"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search" className="lux-interactive text-black/65 dark:text-white/65"><X size={18}/></button>}</label>
      <div className="mt-7 flex flex-wrap items-center gap-2"><span className="mr-1 flex items-center gap-2 text-[10px] tracking-[.16em] text-black/65 dark:text-white/65"><SlidersHorizontal size={13}/> EXPLORE</span>{categories.map((item)=><button key={item} onClick={()=>setCategory(category===item?"":item)} className={`lux-chip ${category===item?"is-active":""}`}>{item}</button>)}</div>
      <div className="mt-12 flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4"><h2 className="font-serif text-2xl">{query||category?"Matching pieces":"The collection"}</h2><span className="text-xs text-black/65 dark:text-white/65">{loading?"Searching...":`${filtered.length} ${filtered.length===1?"piece":"pieces"}`}</span></div>
      {loading?<div className="mt-7"><ProductSkeletonGrid/></div>:error?<p role="alert" className="mt-8 text-sm text-violet-700 dark:text-violet-300">{error}</p>:filtered.length?<AnimatePresence mode="wait"><motion.div key={`${query}-${category}`} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}} className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((product)=><ProductCard key={product._id||product.id} product={product}/>)}</motion.div></AnimatePresence>:<div className="py-20 text-center"><p className="font-serif text-2xl">Nothing found just yet.</p><p className="mt-2 text-sm text-black/65 dark:text-white/65">Try a different search or category.</p></div>}
    </div>
  </main>;
}

export default function SearchPage() {
  return <Suspense fallback={<main className="min-h-[75vh] bg-white px-5 py-16 text-black dark:bg-black dark:text-white"><div className="mx-auto max-w-7xl"><ProductSkeletonGrid/></div></main>}><SearchPageContent/></Suspense>;
}
