"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { favorites } = useStore();
  return <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600">Your saved collection</p><h1 className="mt-2 text-3xl font-bold">Wishlist <span className="text-lg font-medium text-black/55">({favorites.length})</span></h1>{favorites.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{favorites.map((product) => <ProductCard key={product._id || product.id} product={product} />)}</div> : <div className="mt-7 rounded-3xl border border-black/10 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-black"><h2 className="text-xl font-semibold">No favorites saved yet</h2><p className="mt-2 text-sm text-black/55 dark:text-white/75">Tap the heart on anything you love and it will be waiting here.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-violet-400 px-6 py-3 text-sm font-bold text-black">Explore products</Link></div>}</main>;
}
