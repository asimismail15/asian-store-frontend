"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import RecommendationSection from "@/components/RecommendationSection";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, cartLoading, ready, formatPrice } = useStore();
  const [error, setError] = useState("");
  const [busyItem, setBusyItem] = useState("");
  const items = cart.filter((item) => item.product);
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);

  async function changeQuantity(item, delta) {
    setBusyItem(item._id);
    setError("");
    try {
      if (delta < 0 && item.quantity === 1) await removeFromCart(item.product._id || item.product.id, item._id);
      else await addToCart(item.product._id || item.product.id, delta, item.variant, item.product);
    } catch (reason) { setError(reason.message); }
    finally { setBusyItem(""); }
  }

  async function remove(item) {
    setBusyItem(item._id);
    setError("");
    try { await removeFromCart(item.product._id || item.product.id, item._id); }
    catch (reason) { setError(reason.message); }
    finally { setBusyItem(""); }
  }

  return <main className="mx-auto min-h-[65vh] max-w-5xl px-4 py-10 text-black dark:text-white sm:px-6 sm:py-12">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-700 dark:text-violet-300">YOUR SELECTION</p><h1 className="mt-2 text-3xl font-bold">Your cart</h1></div><Link href="/shop" className="text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300">Continue shopping</Link></header>
    {error && <p role="alert" className="mt-5 rounded-lg bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">{error}</p>}
    {!ready || cartLoading ? <p className="py-12 text-sm text-black/55 dark:text-white/60">Loading your cart…</p> : !items.length ? <section className="mt-8 rounded-2xl border border-black/10 p-10 text-center dark:border-white/15"><p className="text-black/60 dark:text-white/65">Your cart is empty.</p><Link href="/shop" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-violet-700 px-6 text-sm font-semibold text-white dark:bg-violet-300 dark:text-black">Browse products</Link></section> : <div className="mt-7 grid items-start gap-6 md:grid-cols-[1fr_300px]">
      <section className="space-y-3" aria-label="Cart items">{items.map((item) => { const { product, quantity } = item; const id = product._id || product.id; return <article key={item._id || id} className="grid grid-cols-[68px_minmax(0,1fr)] gap-3 rounded-2xl border border-black/10 bg-white p-3 dark:border-white/15 dark:bg-black sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4">
        <Link href={`/products/${id}`} className="grid size-[68px] place-items-center rounded-xl bg-white dark:bg-black sm:size-24">{product.image ? <Image src={product.image} alt={product.title} width={96} height={96} unoptimized className="size-full object-contain p-1"/> : <span className="text-xs">Product</span>}</Link>
        <div className="min-w-0"><Link href={`/products/${id}`} className="line-clamp-2 text-sm font-semibold hover:underline">{product.title}</Link><p className="mt-1 text-xs text-black/55 dark:text-white/60">{formatPrice(product.price)}</p>{(item.variant?.size || item.variant?.color) && <p className="mt-1 text-[11px] text-black/55 dark:text-white/60">{[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}</p>}<div className="mt-3 flex flex-wrap items-center gap-2"><div className="flex h-10 items-center rounded-full border border-black/10 dark:border-white/15"><button disabled={busyItem === item._id} onClick={() => changeQuantity(item, -1)} aria-label={`Decrease ${product.title} quantity`} className="grid size-10 place-items-center disabled:opacity-50"><Minus size={14}/></button><span aria-live="polite" className="min-w-7 text-center text-xs">{quantity}</span><button disabled={busyItem === item._id} onClick={() => changeQuantity(item, 1)} aria-label={`Increase ${product.title} quantity`} className="grid size-10 place-items-center disabled:opacity-50"><Plus size={14}/></button></div><button disabled={busyItem === item._id} onClick={() => remove(item)} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs text-violet-700 hover:underline disabled:opacity-50 dark:text-violet-300"><Trash2 size={14}/><span>Remove</span></button></div></div>
        <strong className="col-start-2 text-sm sm:col-start-3 sm:row-start-1">{formatPrice(Number(product.price || 0) * quantity)}</strong>
      </article>; })}</section>
      <aside className="h-fit rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-black"><h2 className="font-bold">Order summary</h2><p className="mt-4 flex justify-between gap-3 text-sm"><span className="text-black/60 dark:text-white/65">Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><p className="mt-2 text-xs text-black/55 dark:text-white/60">Shipping and tax are calculated at checkout.</p><Link href="/checkout" className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-violet-700 px-5 text-center text-sm font-bold text-white dark:bg-violet-300 dark:text-black">Continue to checkout</Link></aside>
    </div>}
    <RecommendationSection sources={items.map((item) => item.product)} title="Complete your collection" />
  </main>;
}
