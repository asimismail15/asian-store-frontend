"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

export default function CheckoutSuccessPage() {
  const search = useSyncExternalStore(() => () => {}, () => window.location.search, () => "");
  const query = Object.fromEntries(new URLSearchParams(search));
  const pending = query.pending === "1";
  const simulated = query.simulated === "1";
  const cod = query.payment === "cod";
  const wallet = query.payment === "easypaisa" || query.payment === "jazzcash";
  return <main className="mx-auto max-w-xl px-5 py-20 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-violet-100 text-2xl text-violet-700">✓</div><h1 className="mt-5 text-3xl font-bold">{simulated ? "Demo checkout complete" : wallet ? "Order received — payment pending" : cod ? "COD order confirmed" : pending ? "Order received" : "Thank you for your order"}</h1><p className="mt-3 text-black/75 dark:text-white/75">{simulated ? "Your cart was cleared and a local confirmation was saved. No payment was processed." : wallet ? "Your order is awaiting EasyPaisa/JazzCash transfer verification. The store will confirm payment after checking the provider transaction." : cod ? "Your order is confirmed. Pay the courier when your order is delivered." : pending ? "Your order was created. Check your orders for payment status." : "Your payment was successful and your order is being prepared."}</p><p className="mt-2 text-sm text-black/55 dark:text-white/60">Order reference: {query.order || "—"}</p><Link href="/track-order" className="mt-7 inline-block rounded-full bg-violet-700 px-6 py-3 font-bold text-white dark:bg-violet-300 dark:text-black">View my orders</Link></main>;
}
