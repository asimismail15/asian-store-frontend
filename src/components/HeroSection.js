"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/StoreProvider";

const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="hero-scene-placeholder" />,
});

const rise = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  const sceneSlot = useRef(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneInView, setSceneInView] = useState(false);
  const reduceMotion = useReducedMotion();
  const { theme } = useStore();

  useEffect(() => {
    if (reduceMotion) return;
    if (!sceneSlot.current || !("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => {
        setSceneReady(true);
        setSceneInView(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setSceneReady(true);
      setSceneInView(entry.isIntersecting);
    }, { rootMargin: "100px" });
    observer.observe(sceneSlot.current);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <section className="hero-showcase-wrap mx-auto max-w-[1600px] px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      <div className="lux-hero hero-showcase relative isolate grid min-h-[min(780px,calc(100svh-7rem))] overflow-hidden rounded-[2rem] border border-violet-200/60 bg-[#faf9ff] dark:border-white/10 dark:bg-[#09080d] lg:grid-cols-[.88fr_1.12fr]">
        <div className="hero-showcase-copy relative z-10 flex flex-col items-start justify-center px-7 py-14 sm:px-12 lg:px-16 xl:px-20">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            transition={{ staggerChildren: 0.12, delayChildren: 0.08 }}
            className="max-w-xl"
          >
            <motion.h1 variants={rise} className="text-5xl font-black leading-[.94] tracking-[-.075em] sm:text-6xl lg:text-[clamp(4.5rem,7vw,7.4rem)]">
              The art of<br />
              <span className="bg-gradient-to-r from-violet-700 via-violet-500 to-fuchsia-400 bg-clip-text font-serif italic font-medium text-transparent">everyday.</span>
            </motion.h1>
            <motion.p variants={rise} className="mt-7 max-w-sm text-sm leading-6 text-black/65 dark:text-white/65 sm:text-base sm:leading-7">
              Objects with a point of view. Meet the considered pieces that make the everyday feel extraordinary.
            </motion.p>
            <motion.div variants={rise}>
              <Link href="/shop" className="lux-cta mt-9 inline-flex items-center gap-3 rounded-full bg-violet-700 px-8 py-4 text-[10px] font-bold tracking-[.14em] text-white transition hover:bg-violet-800 dark:bg-violet-300 dark:text-black dark:hover:bg-violet-200">
                DISCOVER THE COLLECTION <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
          <Link href="#catalog" className="absolute bottom-7 left-7 hidden items-center gap-2 text-[9px] font-semibold tracking-[.15em] text-violet-700 dark:text-violet-300 sm:flex lg:left-12 xl:left-20">
            <ArrowDown size={14} /> SCROLL TO EXPLORE
          </Link>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.78, x: 36, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          ref={sceneSlot}
          className="hero-showcase-stage relative min-h-[380px] overflow-hidden sm:min-h-[480px] lg:min-h-full"
          aria-label="Interactive three-dimensional ASIAN STORE product showcase"
        >
          <div className="hero-scene-glow" aria-hidden="true" />
          {sceneReady || reduceMotion ? <HeroScene theme={theme} reducedMotion={Boolean(reduceMotion)} frameloop={reduceMotion || !sceneInView ? "demand" : "always"} /> : <div aria-hidden="true" className="hero-scene-placeholder" />}
          <div className="hero-scene-index absolute right-6 top-6 z-10 font-mono text-[9px] tracking-[.18em] text-violet-800/60 dark:text-violet-200/55">01 <span className="mx-1 opacity-40">/</span> 08</div>
        </motion.div>
      </div>
    </section>
  );
}
