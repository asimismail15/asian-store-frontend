"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Heart, Star } from "lucide-react";
import { productApi } from "@/lib/api";
import { useStore } from "@/components/StoreProvider";
import RecommendationSection from "@/components/RecommendationSection";
import ProductInspectViewer from "@/components/ProductInspectViewer";
import { rememberViewedProduct } from "@/lib/recommendations";

function RatingStars({ value, size = 16 }) {
  return <span className="inline-flex items-center gap-0.5" aria-label={`${Number(value || 0).toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} className={star <= Math.round(Number(value || 0)) ? "fill-violet-500 text-violet-500" : "text-violet-300"} />)}
  </span>;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, addToCart, isFavorite, toggleFavorite, toast, formatPrice } = useStore();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let active = true;
    rememberViewedProduct(id);
    productApi.get(id).then((result) => { if (active) setProduct(result); }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id]);

  const reviews = useMemo(() => [...(product?.reviews || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [product]);
  const gallery = [...new Set([product?.image, ...(product?.images || [])].filter(Boolean))];
  const sizes = product?.sizes || product?.options?.sizes || [];
  const colors = product?.colors || product?.options?.colors || [];

  async function add() {
    setBusy(true);
    try { await addToCart(product._id, 1, { size: selectedSize, color: selectedColor }, product); toast(`${product.title} added to cart`); }
    catch (err) { toast(err.message, "error"); }
    finally { setBusy(false); }
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!user) { router.push(`/login?next=${encodeURIComponent(`/products/${id}#reviews`)}`); return; }
    setReviewBusy(true); setReviewError(""); setReviewMessage("");
    try {
      const updatedProduct = await productApi.review(id, { rating: reviewRating, comment: reviewComment.trim() });
      setProduct(updatedProduct);
      setReviewComment("");
      setReviewMessage("Your verified review has been published.");
    } catch (err) { setReviewError(err.message); }
    finally { setReviewBusy(false); }
  }

  if (error) return <main className="mx-auto max-w-5xl p-10 text-violet-700">{error}</main>;
  if (!product) return <main className="mx-auto max-w-5xl p-10 text-black/55">Loading product…</main>;

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
    <div className="scroll-section grid gap-8 md:grid-cols-2 md:gap-10">
      <div className="relative">
        <div className="lux-pdp-gallery relative grid min-h-80 place-items-center overflow-hidden rounded-3xl bg-white p-6 dark:bg-black sm:min-h-96 sm:p-8">
          <ProductInspectViewer key={gallery[selectedImage] || "empty"} image={gallery[selectedImage]} alt={product.title} />
          <button onClick={() => toggleFavorite(product)} aria-label={isFavorite(product._id) ? "Remove from wishlist" : "Add to wishlist"} className="action-particle-trigger absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white text-black/75 hover:text-violet-600 dark:bg-black dark:text-white/70"><Heart className={isFavorite(product._id) ? "fill-violet-500 text-violet-500" : ""} /></button>
        </div>
        {gallery.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{gallery.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(index)} aria-label={`Show product image ${index + 1}`} aria-pressed={selectedImage === index} className={`grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 bg-white p-2 transition dark:bg-black ${selectedImage === index ? "border-violet-600 shadow-lg shadow-violet-700/15" : "border-black/10 dark:border-white/15"}`}><Image src={image} alt="" width={80} height={80} unoptimized className="size-full object-contain"/></button>)}</div>}
      </div>
      <section className="self-center">
        <Link href="/shop" className="text-sm text-violet-700 dark:text-violet-300">← Continue shopping</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">{product.category}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{product.title}</h1>
        <p className="mt-5 text-3xl font-bold">{formatPrice(product.price)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2"><RatingStars value={product.rating} /><span className="text-sm font-semibold">{Number(product.rating || 0).toFixed(1)}</span><a href="#reviews" className="text-sm text-black/55 underline underline-offset-4 dark:text-white/70">{product.numReviews || reviews.length} reviews</a></div>
        <p className="mt-5 leading-7 text-black/75 dark:text-white/75">{product.description}</p>
        <p className="mt-5 text-sm text-black/55 dark:text-white/70">{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
        {(sizes.length > 0 || colors.length > 0) && <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {sizes.length > 0 && <label className="text-xs font-semibold">Size<select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm dark:border-white/20 dark:bg-black"><option value="">Choose a size</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>}
          {colors.length > 0 && <label className="text-xs font-semibold">Color<select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm dark:border-white/20 dark:bg-black"><option value="">Choose a color</option>{colors.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>}
        </div>}
        <button disabled={!product.stock || busy || (sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)} onClick={add} className="action-particle-trigger lux-pdp-add mt-7 rounded-full bg-violet-700 px-8 py-3 font-bold text-white disabled:opacity-40">{busy ? "Adding..." : "Add to cart"}</button>
      </section>
    </div>

    <RecommendationSection sources={[product]} />

    <section id="reviews" className="mt-16 border-t border-black/10 pt-10 dark:border-white/15 sm:mt-20">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-bold tracking-[.2em] text-violet-700 dark:text-violet-300">CUSTOMER NOTES</p>
          <h2 className="mt-2 text-2xl font-bold">Reviews & ratings</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3"><RatingStars value={product.rating} size={19} /><span className="text-2xl font-bold">{Number(product.rating || 0).toFixed(1)}</span><span className="text-sm text-black/55 dark:text-white/70">from {product.numReviews || reviews.length} reviews</span></div>
          {user ? product._isDemo ? <p className="mt-5 rounded-xl border border-violet-200 p-4 text-sm text-black/65 dark:border-violet-900 dark:text-white/70">Reviews are available for products in the live store. Demo products can’t receive or submit reviews.</p> : <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-black/10 p-5 dark:border-white/15">
            <h3 className="font-semibold">Share your experience</h3>
            <p className="mt-1 text-xs text-black/55 dark:text-white/65">Reviews are open to customers with a paid order for this product.</p>
            <fieldset className="mt-4">
              <legend className="text-xs font-semibold">Your rating</legend>
              <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setReviewRating(value)} aria-label={`${value} star${value === 1 ? "" : "s"}`} aria-pressed={reviewRating === value} className="rounded p-1 focus-visible:outline-2 focus-visible:outline-violet-600"><Star size={22} className={value <= reviewRating ? "fill-violet-500 text-violet-500" : "text-violet-300"} /></button>)}</div>
            </fieldset>
            <label className="mt-4 block text-xs font-semibold">Your review<textarea required minLength={10} maxLength={1000} rows={4} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="What should other customers know?" className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-transparent px-3 py-3 text-sm outline-none focus:border-violet-600 dark:border-white/20" /></label>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] text-black/50 dark:text-white/60">{reviewComment.length}/1000 characters</span><button disabled={reviewBusy} className="rounded-full bg-violet-700 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{reviewBusy ? "Submitting…" : "Submit review"}</button></div>
            {reviewMessage && <p role="status" className="mt-3 text-sm text-violet-700 dark:text-violet-300">{reviewMessage}</p>}
            {reviewError && <p role="alert" className="mt-3 text-sm text-violet-700 dark:text-violet-300">{reviewError}</p>}
          </form> : <div className="mt-6 rounded-2xl border border-black/10 p-5 dark:border-white/15"><p className="text-sm">Purchased this item? Sign in to leave a verified review.</p><Link href={`/login?next=${encodeURIComponent(`/products/${id}#reviews`)}`} className="mt-3 inline-flex rounded-full bg-violet-700 px-5 py-2.5 text-xs font-bold text-white">Sign in</Link></div>}
        </div>

        <div className="space-y-3">
          {reviews.length ? reviews.map((review, index) => <article key={review._id || `${review.user}-${index}`} className="rounded-2xl border border-black/10 p-5 dark:border-white/15">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{review.name || "ASIAN STORE customer"}</p><div className="mt-1 flex items-center gap-2"><RatingStars value={review.rating} size={13} /><span className="text-xs text-black/55 dark:text-white/65">{Number(review.rating).toFixed(0)} / 5</span></div></div>{review.verifiedPurchase === true && <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200"><BadgeCheck size={13} />Verified purchase</span>}</div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/75 dark:text-white/75">{review.comment}</p>
            {review.createdAt && <time className="mt-3 block text-[10px] text-black/50 dark:text-white/60" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time>}
          </article>) : <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center dark:border-white/20"><p className="font-semibold">No written reviews yet</p><p className="mt-2 text-sm text-black/55 dark:text-white/65">Be the first verified customer to share a note.</p></div>}
        </div>
      </div>
    </section>
  </main>;
}
