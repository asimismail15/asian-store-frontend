"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, Clapperboard, Headphones, Settings, ShoppingBag, Sparkles, X, Bell } from "lucide-react";
import { useStore } from "@/components/StoreProvider";

const coreDepartments = ["Electronics", "Fashion", "Home & Living", "Beauty & Care", "Sports & Wellness", "Accessories"];
const departmentDescriptions = ["Technology", "Everyday style", "For your space", "Care & beauty", "Move well", "Finishing touches"];

function DrawerLink({ href, onClick, children, icon: Icon = ChevronRight }) {
  return <Link href={href} onClick={onClick} className="group flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-black/80 transition hover:bg-violet-50 hover:text-violet-800 dark:text-white/80 dark:hover:bg-violet-950/50 dark:hover:text-violet-200"><span>{children}</span><Icon size={15} className="shrink-0 text-violet-600  dark:text-violet-300"/></Link>;
}

export default function DepartmentsDrawer({ open, onClose, categories = [], unread = 0, onMarkRead = () => {}, onNotificationRead = () => {} }) {
  const { t } = useStore();
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  const departmentList = [...new Set([...coreDepartments, ...categories])];
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button type="button" aria-label="Close departments menu" onClick={onClose} className="departments-backdrop absolute inset-0 bg-black/55 backdrop-blur-[2px] dark:bg-black/75" />
      <aside id="departments-drawer-title" role="dialog" aria-modal="true" aria-label={t("browse")} className="departments-drawer absolute inset-y-0 left-0 flex w-[min(23rem,88vw)] flex-col border-r border-violet-200 bg-white text-black shadow-2xl dark:border-violet-900 dark:bg-[#09090b] dark:text-white">
        <header className="flex items-center justify-between border-b border-violet-100 bg-black px-5 py-5 text-white dark:border-violet-900 dark:bg-[#111111]">
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-violet-300">ASIAN STORE</p><h2 className="mt-1 text-lg font-semibold">{t("browse")}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close departments menu" className="grid size-10 place-items-center rounded-full border border-white/20 text-white transition hover:border-violet-300 hover:bg-violet-700"><X size={19}/></button>
        </header>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="All departments">
          <section aria-labelledby="digital-content-title">
            <h3 id="digital-content-title" className="mb-2 flex items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300"><BookOpen size={14}/> {t("digital")}</h3>
            <DrawerLink href="/shop" onClick={onClose} icon={ArrowRight}>Explore digital collection</DrawerLink>
            <DrawerLink href="/shop" onClick={onClose} icon={Headphones}>Audio & accessories</DrawerLink>
            <DrawerLink href="/shop" onClick={onClose} icon={Clapperboard}>Media & entertainment</DrawerLink>
          </section>

          <section className="mt-5 border-t border-black/10 pt-5 dark:border-white/10" aria-labelledby="shop-departments-title">
            <h3 id="shop-departments-title" className="mb-2 flex items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300"><ShoppingBag size={14}/> {t("shopBy")}</h3>
            <DrawerLink href="/shop" onClick={onClose} icon={ArrowRight}>{t("shopAll")}</DrawerLink>
            {departmentList.map((category, index) => <DrawerLink key={category} href={`/category/${encodeURIComponent(category)}`} onClick={onClose}><span className="block font-medium">{category}</span><span className="mt-0.5 block text-[10px] text-black/55 dark:text-white/55">{departmentDescriptions[index % departmentDescriptions.length]}</span></DrawerLink>)}
          </section>

          <section className="mt-5 border-t border-black/10 pt-5 dark:border-white/10" aria-labelledby="programs-title">
            <h3 id="programs-title" className="mb-2 flex items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300"><Sparkles size={14}/> {t("programs")}</h3>
            <DrawerLink href="/shop" onClick={onClose}>New arrivals</DrawerLink>
            <DrawerLink href="/wishlist" onClick={onClose}>Your wishlist</DrawerLink>
            <DrawerLink href="/countries" onClick={onClose}>{t("shipping")}</DrawerLink>
          </section>

          <section className="mt-5 border-t border-black/10 pt-5 dark:border-white/10" aria-labelledby="drawer-settings-title">
            <h3 id="drawer-settings-title" className="mb-2 flex items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300"><Settings size={14}/> {t("settings")}</h3>
            <DrawerLink href="/settings" onClick={onClose}>Store settings</DrawerLink>
            <DrawerLink href="/profile" onClick={onClose}>My account</DrawerLink>
            <DrawerLink href="/orders" onClick={onClose}>{t("tracking")}</DrawerLink>
            <div className="mt-2 rounded-xl border border-violet-200/70 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
              <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-semibold"><Bell size={14} className="text-violet-700 dark:text-violet-300"/>Notifications{unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-violet-700 px-1 text-[9px] leading-4 text-white">{unread}</span>}</p><button type="button" onClick={onMarkRead} className="text-[10px] text-violet-700 hover:underline dark:text-violet-300">Mark read</button></div>
              {[{title:"Your next favourite is waiting",body:"Explore the latest arrivals in the collection.",href:"/shop"},{title:"A more considered delivery",body:"Order updates are available in your account.",href:"/orders"},{title:"Private collection note",body:"Discover pieces selected for the season.",href:"/shop"}].map((item,index)=><Link key={item.title} href={item.href} onClick={onNotificationRead} className="lux-interactive mt-2 flex gap-2 rounded-lg p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-violet-700 dark:bg-violet-300"/><span><span className="block text-[11px] font-medium">{item.title}</span><span className="mt-0.5 block text-[10px] leading-4 text-black/55 dark:text-white/60">{item.body}</span></span>{index < unread && <i className="mt-1 size-1.5 shrink-0 rounded-full bg-violet-700 dark:bg-violet-300"/>}</Link>)}
            </div>
          </section>
        </nav>
      </aside>
    </div>
  );
}


