"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useStore } from "@/components/StoreProvider";

export default function HeroSection() {
  const { theme } = useStore();
  const image = theme === "dark"
    ? "/asian-store-hero-dark-neutral.png"
    : "/asian-store-hero-light-neutral.png";

  return (
    <section className="mx-auto max-w-[1500px] px-4 pt-3 sm:px-8 sm:pt-6">
      <div className="lux-hero relative grid min-h-[510px] overflow-hidden bg-white dark:bg-[#111111] md:min-h-[590px] md:grid-cols-[.85fr_1.15fr]">
        <div className="relative z-10 flex flex-col items-start justify-center px-7 py-12 sm:px-14 md:px-16">
          <p className="text-[9px] font-bold tracking-[.24em] text-violet-700 dark:text-violet-300">ASIAN STORE &middot; COLLECTION 01</p>
          <h1 className="mt-6 max-w-lg text-5xl font-black leading-[.98] tracking-[-.075em] sm:text-6xl lg:text-[76px]">
            The art of<br />
            <span className="bg-gradient-to-r from-violet-700 via-violet-600 to-violet-500 bg-clip-text font-serif italic text-transparent">everyday.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-black/65 dark:text-white/70">
            A thoughtful edit of pieces made for your life. Discover good design, considered details, and enduring essentials.
          </p>
          <Link href="/shop" className="lux-cta mt-8 inline-flex items-center gap-3 rounded-full bg-violet-700 px-8 py-4 text-[11px] font-bold tracking-[.12em] text-white shadow-lg shadow-violet-700/20 transition ">
            DISCOVER THE COLLECTION <ArrowRight size={14} />
          </Link>
          <Link href="#catalog" className="absolute bottom-7 left-7 hidden items-center gap-2 text-[9px] tracking-[.15em] text-violet-700 sm:flex md:left-14">
            <ArrowDown size={14} /> SCROLL TO EXPLORE
          </Link>
        </div>

        <div className="lux-hero-image relative min-h-[300px] overflow-hidden bg-white dark:bg-[#111111] md:min-h-full">
          <Image
            src={image}
            alt="A shopper presenting the ASIAN STORE logo on her phone"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="lux-hero-photo"
          />
          <div aria-hidden="true" className={`absolute inset-0 ${theme === "dark" ? "bg-gradient-to-tr from-[#09090b]/45 via-[#111111]/15 to-black/20 mix-blend-multiply" : "bg-gradient-to-tr from-white/25 via-transparent to-white/10 mix-blend-screen"}`} />
          <div className="absolute bottom-5 right-5 rounded-xl bg-white/90 px-4 py-3 shadow-xl backdrop-blur dark:bg-black/80">
            <p className="text-[8px] font-bold tracking-[.18em] text-violet-700">THE EDIT</p>
            <p className="mt-1 text-xs font-semibold">Everything you love, in one place</p>
          </div>
        </div>
      </div>
    </section>
  );
}

