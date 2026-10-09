"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { api, authApi, productApi } from "@/lib/api";
import { useStore } from "@/components/StoreProvider";
import AdminAnalytics from "@/components/AdminAnalytics";

const emptyProduct = { title: "", price: "", description: "", category: "", image: "", images: [], sizes: "", colors: "", stock: "" };
const MAX_TOTAL_IMAGE_CHARS = 9_000_000;

async function imageFileToDataUrl(file) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image file.`);
  if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} is too large to process. Choose an image under 15 MB.`);

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the selected image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error(`Could not prepare ${file.name}. Try another image.`);
  if (blob.size > 1_400_000) {
    const smaller = document.createElement("canvas");
    const reduced = Math.min(1, 1200 / Math.max(canvas.width, canvas.height));
    smaller.width = Math.max(1, Math.round(canvas.width * reduced));
    smaller.height = Math.max(1, Math.round(canvas.height * reduced));
    smaller.getContext("2d")?.drawImage(canvas, 0, 0, smaller.width, smaller.height);
    blob = await new Promise((resolve) => smaller.toBlob(resolve, "image/webp", 0.68));
  }
  if (!blob || blob.size > 1_400_000) throw new Error(`${file.name} could not be compressed small enough. Choose a smaller image.`);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(blob);
  });
}

const splitList = (value) => String(value || "").split(",").map((entry) => entry.trim()).filter(Boolean);

export default function AdminPage() {
  const { user, ready } = useStore();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const [dash, allOrders, firstPage] = await Promise.all([authApi.adminDashboard(), api("/orders"), productApi.list({ page: 1, demo: false })]);
    const extraPages = await Promise.all(Array.from({ length: Math.max(0, (firstPage.pages || 1) - 1) }, (_, index) => productApi.list({ page: index + 2, demo: false })));
    setDashboard(dash);
    setOrders(allOrders);
    setProducts([...(firstPage.products || []), ...extraPages.flatMap((result) => result.products || [])]);
  }

  useEffect(() => {
    if (user?.role === "admin") Promise.resolve().then(load).catch((reason) => setError(reason.message));
  }, [user]);

  function totalImageSize(primary, gallery) {
    return [primary, ...gallery].reduce((total, source) => total + (String(source).startsWith("data:") ? source.length : 0), 0);
  }

  async function selectPrimaryImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true); setError(""); setMessage("");
    try {
      const image = await imageFileToDataUrl(file);
      if (totalImageSize(image, form.images) > MAX_TOTAL_IMAGE_CHARS) throw new Error("The selected images are too large together. Remove a gallery image or choose smaller files.");
      setForm((current) => ({ ...current, image }));
    } catch (reason) { setError(reason.message); }
    finally { setUploading(false); }
  }

  async function selectGalleryImages(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true); setError(""); setMessage("");
    try {
      const newImages = await Promise.all(files.map(imageFileToDataUrl));
      const images = [...form.images, ...newImages];
      if (totalImageSize(form.image, images) > MAX_TOTAL_IMAGE_CHARS) throw new Error("The selected images are too large together. Remove a gallery image or choose fewer files.");
      setForm((current) => ({ ...current, images }));
    } catch (reason) { setError(reason.message); }
    finally { setUploading(false); }
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images,
      sizes: splitList(form.sizes),
      colors: splitList(form.colors),
    };
    try {
      if (editing) await productApi.update(editing, body);
      else await productApi.create(body);
      setForm({ ...emptyProduct });
      setEditing(null);
      setMessage("Product saved.");
      await load();
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    setError("");
    try { await productApi.remove(id); setMessage("Product deleted."); await load(); }
    catch (reason) { setError(reason.message); }
  }

  async function updateOrderStatus(id, status) {
    setError(""); setMessage("");
    try {
      await api(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      setOrders((current) => current.map((order) => order._id === id ? { ...order, status } : order));
      setMessage(`Order ${id} updated to ${status}. Customer notification simulated.`);
    } catch (reason) { setError(reason.message); }
  }

  async function verifyWalletPayment(order) {
    if (!window.confirm(`Have you verified Trx ID ${order.paymentTransactionId} in the ${order.paymentMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} merchant account?`)) return;
    setError(""); setMessage("");
    try {
      const updated = await api(`/orders/${order._id}/payment-status`, { method: "PUT" });
      setOrders((current) => current.map((item) => item._id === order._id ? updated : item));
      setMessage(`Payment approved for order ${order._id}.`);
    } catch (reason) { setError(reason.message); }
  }

  function editProduct(product) {
    setEditing(product._id);
    setForm({
      title: product.title || "", price: product.price ?? "", description: product.description || "", category: product.category || "",
      image: product.image || "", images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "", colors: Array.isArray(product.colors) ? product.colors.join(", ") : "", stock: product.stock ?? "",
    });
    setError(""); setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) return <main className="p-12 text-center text-black dark:text-white">Loading…</main>;
  if (!user) return <main className="p-8 text-center text-black dark:text-white sm:p-16"><h1 className="text-2xl font-bold">Admin sign in required</h1><Link href="/login?next=/admin" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-violet-700 px-5 text-white dark:bg-violet-300 dark:text-black">Sign in</Link></main>;
  if (user.role !== "admin") return <main className="mx-auto max-w-3xl px-5 py-20 text-center text-black dark:text-white"><h1 className="text-2xl font-bold">Access denied</h1><p className="mt-2 text-black/65 dark:text-white/70">This page is for store administrators.</p></main>;

  const controlClass = "mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-violet-600 dark:border-white/20 dark:bg-black dark:text-white dark:focus:border-violet-300";
  const fileClass = `${controlClass} file:mr-3 file:rounded-full file:border-0 file:bg-violet-700 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white dark:file:bg-violet-300 dark:file:text-black`;

  return <main className="mx-auto max-w-6xl px-4 py-10 text-black dark:text-white sm:px-5 sm:py-12">
    <p className="text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">Store management</p>
    <h1 className="mt-2 text-3xl font-bold">Admin dashboard</h1>
    {error && <p role="alert" className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">{error}</p>}
    {message && <p role="status" className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">{message}</p>}
    <section className="mt-5 rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-black"><h2 className="font-bold">API access</h2><p className="mt-2 text-sm text-black/65 dark:text-white/70">{dashboard?.message || "Checking administrator access…"}</p></section>
    <AdminAnalytics metrics={dashboard?.metrics}/>

    <section className="mt-8 grid gap-7 lg:grid-cols-[360px_1fr]">
      <form onSubmit={save} className="h-fit space-y-4 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-black">
        <h2 className="text-lg font-bold">{editing ? "Edit product" : "Add product"}</h2>
        {[ ["title", "Title", "text"], ["price", "Price", "number"], ["category", "Category", "text"] ].map(([key, label, type]) => <label key={key} className="block text-sm font-medium">{label}<input required type={type} min={type === "number" ? "0" : undefined} step={key === "price" ? "0.01" : undefined} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className={controlClass}/></label>)}

        <div>
          <label htmlFor="primary-product-image" className="block text-sm font-medium">Primary product image</label>
          <input id="primary-product-image" type="file" accept="image/*" onChange={selectPrimaryImage} className={fileClass}/>
          <p className="mt-1 text-[11px] leading-4 text-black/55 dark:text-white/60">Choose an image from your device. It is resized and saved with this product.</p>
          {form.image && <div className="relative mt-3 grid aspect-[4/3] max-w-xs place-items-center overflow-hidden rounded-xl border border-black/10 bg-white p-2 dark:border-white/15"><Image src={form.image} alt="Primary product preview" width={320} height={240} unoptimized className="h-full w-full object-contain"/><button type="button" onClick={() => setForm((current) => ({ ...current, image: "" }))} aria-label="Remove primary image" className="absolute right-2 top-2 grid size-9 place-items-center rounded-full border border-black/10 bg-white text-black dark:border-white/15 dark:bg-black dark:text-white"><X size={16}/></button></div>}
        </div>

        <div>
          <label htmlFor="gallery-product-images" className="block text-sm font-medium">Gallery images</label>
          <input id="gallery-product-images" type="file" accept="image/*" multiple onChange={selectGalleryImages} className={fileClass}/>
          <p className="mt-1 text-[11px] leading-4 text-black/55 dark:text-white/60">Select one or more additional product photos.</p>
          {form.images.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{form.images.map((image, index) => <div key={`${image.slice(0, 60)}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-white p-1 dark:border-white/15"><Image src={image} alt={`Gallery preview ${index + 1}`} width={96} height={96} unoptimized className="size-full object-contain"/><button type="button" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} aria-label={`Remove gallery image ${index + 1}`} className="absolute right-1 top-1 grid size-8 place-items-center rounded-full border border-black/10 bg-white text-black dark:border-white/15 dark:bg-black dark:text-white"><X size={14}/></button></div>)}</div>}
        </div>

        {[ ["sizes", "Sizes (comma separated)"], ["colors", "Colors (comma separated)"], ["stock", "Stock"] ].map(([key, label]) => <label key={key} className="block text-sm font-medium">{label}<input type={key === "stock" ? "number" : "text"} min={key === "stock" ? "0" : undefined} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className={controlClass}/></label>)}
        <label className="block text-sm font-medium">Description<textarea required rows="3" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={controlClass}/></label>
        <button disabled={busy || uploading || !form.image} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-50 dark:bg-violet-300 dark:text-black"><ImagePlus size={16}/>{uploading ? "Preparing images…" : busy ? "Saving…" : editing ? "Update product" : "Add product"}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ ...emptyProduct }); setError(""); }} className="min-h-10 w-full text-sm text-black/60 dark:text-white/65">Cancel edit</button>}
      </form>

      <section><h2 className="text-lg font-bold">Products ({products.length})</h2><div className="mt-3 space-y-2">{products.map((product) => <article key={product._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-black"><div className="flex min-w-0 items-center gap-3">{product.image && <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-white p-1"><Image src={product.image} alt="" width={56} height={56} unoptimized className="size-full object-contain"/></div>}<div className="min-w-0"><p className="truncate font-semibold">{product.title}</p><p className="text-xs text-black/55 dark:text-white/60">{Number(product.price).toFixed(2)} · stock {product.stock}</p></div></div><div className="flex min-h-10 items-center gap-4 text-sm"><button onClick={() => editProduct(product)} className="text-violet-700 dark:text-violet-300">Edit</button><button onClick={() => remove(product._id)} className="text-violet-700 dark:text-violet-300">Delete</button></div></article>)}</div></section>
    </section>

    <section className="mt-10"><h2 className="text-xl font-bold">Recent orders ({orders.length})</h2><div className="mt-3 space-y-2">{orders.slice(0, 10).map((order) => <article key={order._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/15 dark:bg-black"><div className="min-w-full"><p className="font-semibold">Order {order._id}</p><p className="mt-1 text-xs text-black/60 dark:text-white/65">Payment: {({ easypaisa: "EasyPaisa", jazzcash: "JazzCash", card: "Credit / Debit Card", cod: "Cash on Delivery" })[order.paymentMethod] || "Unknown"} · {order.paymentStatus || (order.isPaid ? "Paid" : "Pending")}</p>{order.paymentSenderPhone && <p className="mt-1 text-xs text-black/60 dark:text-white/65">Sender number: {order.paymentSenderPhone}</p>}{order.paymentTransactionId && <p className="mt-1 break-all text-xs text-black/60 dark:text-white/65">Trx ID: {order.paymentTransactionId}</p>}{order.paymentReference && !order.paymentTransactionId && <p className="mt-1 break-all text-xs text-black/55 dark:text-white/60">Payment reference: {order.paymentReference}</p>}</div><label className="flex items-center gap-2 text-xs text-black/60 dark:text-white/65">Order status<select aria-label={`Update status for order ${order._id}`} value={order.status || "Pending"} onChange={(event) => updateOrderStatus(order._id, event.target.value)} className="rounded-lg border border-black/10 bg-white px-2 py-2 text-black dark:border-white/15 dark:bg-black dark:text-white">{["Pending", "Processing", "Packed", "Shipped", "Out for delivery", "Delivered", "Cancelled"].map((status) => <option key={status}>{status}</option>)}</select></label>{["easypaisa", "jazzcash"].includes(order.paymentMethod) && order.paymentStatus === "Pending Verification" && <button type="button" onClick={() => verifyWalletPayment(order)} className="rounded-full bg-violet-700 px-4 py-2.5 text-xs font-semibold text-white dark:bg-violet-300 dark:text-black">Verify and approve payment</button>}{(order.giftOptions?.giftWrapped || order.giftOptions?.giftMessage) && <div className="min-w-full rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-900 dark:bg-violet-950/40 dark:text-violet-100"><strong>{order.giftOptions.giftWrapped ? "Luxury packaging requested" : "Gift note"}</strong>{order.giftOptions.giftMessage && <p className="mt-1 whitespace-pre-wrap">“{order.giftOptions.giftMessage}”</p>}</div>}<strong>{Number(order.totalPrice).toFixed(2)}</strong></article>)}</div></section>
  </main>;
}
