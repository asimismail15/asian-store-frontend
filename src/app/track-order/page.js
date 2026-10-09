"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PackageCheck, Search, RefreshCw } from "lucide-react";
import { orderApi } from "@/lib/api";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

function findDemoOrder(query) {
  try {
    const orders = JSON.parse(localStorage.getItem("asian-store-demo-orders") || "[]");
    const value = query.trim().toLowerCase();
    return orders.find((order) => order.id?.toLowerCase() === value || order.shipping?.email?.toLowerCase() === value);
  } catch { return null; }
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const lookup = useCallback(async (value = query) => {
    const term = value.trim();
    if (!term) { setError("Enter an order ID or checkout email to continue."); return; }
    setLoading(true); setError(""); setSearched(true);
    try {
      const demo = findDemoOrder(term);
      if (demo) {
        setOrder({ _id: demo.id, createdAt: demo.createdAt, totalPrice: demo.total, status: demo.status || "Pending", demo: true });
      } else {
        setOrder(await orderApi.track(term));
      }
    } catch (err) { setOrder(null); setError(err.message || "We couldn't find that order."); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => {
    if (!order || order.demo || order.status?.toLowerCase() === "delivered") return;
    const timer = window.setInterval(() => lookup(query), 30000);
    return () => window.clearInterval(timer);
  }, [order, query, lookup]);

  return <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-12 text-black dark:text-white sm:py-16">
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-700 dark:text-violet-300">ASIAN STORE · ORDER CARE</p>
      <h1 className="mt-3 text-3xl font-black sm:text-4xl">Track your order</h1>
      <p className="mt-3 text-sm text-black/60 dark:text-white/65">Enter your order number or the email used at checkout to see the latest delivery update.</p>
      <form onSubmit={(event) => { event.preventDefault(); lookup(); }} className="mt-8 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/15 dark:bg-black sm:flex-row">
        <label className="sr-only" htmlFor="order-lookup">Order ID or email</label>
        <input id="order-lookup" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order ID or email address" className="min-h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-violet-600 dark:border-white/15 dark:bg-black" />
        <button disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 text-sm font-bold text-white disabled:opacity-60 dark:bg-violet-300 dark:text-black"><Search size={16}/>{loading ? "Looking up…" : "Track order"}</button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">{error}</p>}
    </div>

    {order && <article className="mx-auto mt-9 max-w-3xl rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-black sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">Shipment status</p><h2 className="mt-1 text-lg font-bold">Order #{String(order._id).slice(-8).toUpperCase()}</h2><p className="mt-1 text-xs text-black/55 dark:text-white/55">Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "recently"}</p></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">{order.status || "Order placed"}</span><button type="button" aria-label="Refresh order status" onClick={() => lookup()} className="grid size-9 place-items-center rounded-full border border-black/10 dark:border-white/15"><RefreshCw size={14}/></button></div>
      </div>
      <OrderStatusTimeline order={order}/>
      <p className="mt-6 flex items-center gap-2 border-t border-black/10 pt-4 text-xs text-black/55 dark:border-white/15 dark:text-white/55"><PackageCheck size={15} className="text-violet-700 dark:text-violet-300"/>Status refreshes automatically every 30 seconds.</p>
    </article>}
    {!order && searched && !error && !loading && <p className="mt-8 text-center text-sm text-black/60 dark:text-white/60">No matching order was found.</p>}
    <p className="mt-8 text-center text-xs text-black/55 dark:text-white/55">Looking for all your purchases? <Link href="/orders" className="font-semibold text-violet-700 underline dark:text-violet-300">View your orders</Link></p>
  </main>;
}
