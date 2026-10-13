"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Heart, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useStore } from "@/components/StoreProvider";
import QuickViewModal from "@/components/QuickViewModal";

function ActionBurst({ kind, pulse }) {
  if (!pulse) return null;

  return (
    <span key={`${kind}-${pulse}`} className={`action-burst action-burst-${kind}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <i key={index} style={{ "--burst-angle": `${index * 45}deg`, "--burst-delay": `${index * 16}ms` }} />
      ))}
    </span>
  );
}

export default function ProductCard({ product, onQuickView, index = 0 }) {
  const { addToCart, isFavorite, toggleFavorite, toast, formatPrice } = useStore();
  const [busy, setBusy] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [feedback, setFeedback] = useState({ target: "", pulse: 0 });
  const visualRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const id = product._id || product.id;
  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
  const image = images[0];
  const favorite = isFavorite(id);

  function triggerFeedback(target) {
    setFeedback((current) => ({ target, pulse: current.pulse + 1 }));
  }

  function tilt(event) {
    if (reduceMotion || event.pointerType !== "mouse" || !visualRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visualRef.current.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
    visualRef.current.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
    visualRef.current.style.transform = `perspective(1000px) rotateX(${y * -8}deg) rotateY(${x * 9}deg) translateZ(8px)`;
  }

  function resetTilt() {
    if (visualRef.current) visualRef.current.style.transform = "";
  }

  async function add() {
    setBusy(true);
    try {
      await addToCart(id, 1, {}, product);
      triggerFeedback("cart");
      toast(`${product.title} added to your bag`);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  function saveToWishlist(target) {
    toggleFavorite(product);
    triggerFeedback(target);
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28, rotateX: 5, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.68, delay: (index % 4) * 0.055, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.012 }}
      className="lux-product group"
    >
      <div ref={visualRef} onPointerMove={tilt} onPointerLeave={resetTilt} className="lux-product-visual relative overflow-hidden bg-[#ffffff] dark:bg-[#000000]">
        <button type="button" onClick={() => onQuickView ? onQuickView(product) : setInspecting(true)} aria-label={`Inspect ${product.title} in 3D`} className="block w-full cursor-zoom-in text-left">
          <div className="relative aspect-[.78] w-full">
            {image ? (
            <Image src={image} alt={product.title} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw" className="lux-product-image object-contain p-2.5 sm:p-8" />
            ) : (
              <div className="grid h-full place-items-center font-serif text-7xl text-black/40">A.</div>
            )}
          </div>
        </button>

        {product.stock > 0 && product.stock < 6 && (
          <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1.5 text-[8px] font-semibold tracking-[.12em] text-black/75 dark:bg-black/70 dark:text-white/75">LOW STOCK</span>
        )}

        <motion.button
          type="button"
          onClick={() => saveToWishlist("favorite-desktop")}
          whileTap={reduceMotion ? undefined : { scale: 0.82, rotate: -8 }}
          aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
          className="action-feedback-host lux-glass absolute right-3 top-3 grid size-9 place-items-center rounded-full text-black/75 transition-colors hover:text-violet-700 dark:text-white/75"
        >
          <motion.span key={`favorite-icon-${feedback.target === "favorite-desktop" ? feedback.pulse : 0}`} animate={feedback.target === "favorite-desktop" ? { scale: [1, 0.72, 1.28, 1] } : undefined} transition={{ type: "spring", stiffness: 440, damping: 13 }}>
            <Heart size={15} className={favorite ? "fill-current" : ""} />
          </motion.span>
          {feedback.target === "favorite-desktop" && <ActionBurst kind="favorite" pulse={feedback.pulse} />}
        </motion.button>

        <button type="button" onClick={() => onQuickView ? onQuickView(product) : setInspecting(true)} aria-label={`Quick view ${product.title}`} className="lux-glass absolute bottom-3 left-3 right-3 rounded-xl py-3 text-[9px] font-semibold tracking-[.15em] hover:bg-white/95 dark:hover:bg-black/90">QUICK VIEW</button>
      </div>
      {inspecting && <QuickViewModal product={product} onClose={() => setInspecting(false)} />}

        <div className="pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-semibold tracking-[.1em] text-violet-600 dark:text-violet-300 sm:tracking-[.18em]">{product.category?.toUpperCase()}</p>
            <Link href={`/products/${id}`}><h2 className="mt-1 line-clamp-2 break-words text-[11px] font-medium leading-4 tracking-[.01em] hover:underline sm:mt-1.5 sm:text-xs sm:leading-5">{product.title}</h2></Link>
          </div>
          <motion.button
            type="button"
            onClick={() => saveToWishlist("favorite-mobile")}
            whileTap={reduceMotion ? undefined : { scale: 0.82, rotate: -8 }}
            aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
            className="action-feedback-host relative mt-1 shrink-0 text-black/55 transition hover:text-violet-500 sm:hidden"
          >
            <motion.span key={`mobile-favorite-icon-${feedback.target === "favorite-mobile" ? feedback.pulse : 0}`} animate={feedback.target === "favorite-mobile" ? { scale: [1, 0.72, 1.28, 1] } : undefined} transition={{ type: "spring", stiffness: 440, damping: 13 }}>
              <Heart size={15} className={favorite ? "fill-current" : ""} />
            </motion.span>
            {feedback.target === "favorite-mobile" && <ActionBurst kind="favorite" pulse={feedback.pulse} />}
          </motion.button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wide">{formatPrice(product.price)}</p>
          {product.rating > 0 ? (
            <span className="flex items-center gap-1 text-[9px] text-violet-600 dark:text-violet-300"><Star size={11} className="fill-current" />{Number(product.rating).toFixed(1)}</span>
          ) : (
            <span className="text-[8px] tracking-[.1em] text-black/55">{product.stock > 0 ? "AVAILABLE" : "SOLD OUT"}</span>
          )}
        </div>

        <motion.button
          type="button"
          disabled={busy || product.stock <= 0}
          onClick={add}
          whileTap={reduceMotion || busy || product.stock <= 0 ? undefined : { scale: 0.975 }}
          className="action-feedback-host relative lux-glass mt-2.5 min-h-11 w-full rounded-full border border-violet-200/70 px-1 py-2 text-[8px] font-semibold tracking-[.1em] text-violet-800 hover:border-violet-700 hover:bg-violet-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:mt-3 sm:px-3 sm:text-[9px] sm:tracking-[.14em] dark:border-violet-900 dark:text-violet-200 dark:hover:bg-violet-600"
        >
          {product._isDemo ? "DEMO ITEM" : busy ? "ADDING..." : "ADD TO BAG"}
          {feedback.target === "cart" && <ActionBurst kind="cart" pulse={feedback.pulse} />}
        </motion.button>
      </div>
    </motion.article>
  );
}
