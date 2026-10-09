"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Globe2, PackageCheck } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { shippingDestinations } from "@/lib/regions";

const formatRate = (value, currency) => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

export default function CountriesPage() {
  const { selectedCountry, setShippingCountry } = useStore();
  const [weight, setWeight] = useState("1");
  const destination = useMemo(
    () => shippingDestinations.find(({ country }) => country === selectedCountry) || shippingDestinations[0],
    [selectedCountry],
  );
  const weightKg = Math.max(0.5, Number(weight) || 0.5);
  const estimatedRate = destination.baseRate + destination.perKgRate * weightKg;

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-black px-6 py-9 text-white sm:px-10 sm:py-11">
        <div className="absolute -right-12 -top-16 size-64 rounded-full bg-violet-700/30 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-violet-300"><Globe2 size={15}/> ASIAN STORE · INTERNATIONAL DELIVERY</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Plan your delivery<span className="text-violet-300">.</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Choose a destination and parcel weight to see an estimated delivery window and shipping cost.</p>
        </div>
      </section>

      <section id="shipping-calculator" className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-black sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-700 dark:text-violet-300">SHIPPING ESTIMATOR</p>
          <h2 className="mt-2 text-2xl font-bold">Delivery estimate</h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-black/55 dark:text-white/65">Enter an approximate parcel weight. Rates are planning estimates and may vary with carrier charges, duties, and remote-area fees.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-semibold">Destination
              <select value={destination.country} onChange={(event) => setShippingCountry(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-black outline-none focus:border-violet-700 dark:border-white/20 dark:bg-black dark:text-white">
                {shippingDestinations.map((item) => <option key={item.country} value={item.country}>{item.country}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold">Parcel weight (kg)
              <input type="number" min="0.5" step="0.5" value={weight} onChange={(event) => setWeight(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-black outline-none focus:border-violet-700 dark:border-white/20 dark:bg-black dark:text-white" />
            </label>
          </div>
        </div>

        <aside className="rounded-3xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-900 dark:bg-violet-950/30 sm:p-8" aria-live="polite">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-700 dark:text-violet-300">ESTIMATED SHIPPING</p>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold"><span className="text-2xl" aria-hidden="true">{destination.flag}</span>{destination.country}</p>
          <p className="mt-4 text-4xl font-black tracking-tight">{formatRate(estimatedRate, destination.currency)}</p>
          <p className="mt-1 text-xs text-black/55 dark:text-white/65">For approximately {weightKg} kg</p>
          <div className="mt-6 grid gap-3 border-t border-violet-200 pt-5 dark:border-violet-800">
            <p className="flex items-center gap-2 text-xs"><Globe2 size={15} className="text-violet-700 dark:text-violet-300"/>Shipping zone: <strong>{destination.region}</strong></p>
            <p className="flex items-center gap-2 text-xs"><Clock3 size={15} className="text-violet-700 dark:text-violet-300"/>Delivery: <strong>{destination.delivery}</strong></p>
            <p className="flex items-center gap-2 text-xs"><PackageCheck size={15} className="text-violet-700 dark:text-violet-300"/>Currency: <strong>{destination.currency} · {destination.currencyName}</strong></p>
          </div>
        </aside>
      </section>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 dark:border-white/15 dark:bg-black">
        <p className="text-sm font-semibold">Need an update on an existing delivery?</p>
        <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-violet-800 hover:underline dark:text-violet-200">Track an order <ArrowRight size={14}/></Link>
      </div>
    </main>
  );
}
