"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useStore } from "@/components/StoreProvider";

const DEFAULT_PREFERENCES = { orderUpdates: true, newArrivals: false, offers: false };

export default function SettingsPage() {
  const store = useStore();
  const { user } = store;
  if (!user) return <main className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-5 py-16 text-center"><div><ShieldCheck className="mx-auto size-9 text-violet-600"/><h1 className="mt-4 text-2xl font-semibold">Sign in to manage your settings</h1><p className="mt-2 text-sm text-black/55">Your account preferences are available after you sign in.</p><Link href="/login?next=/settings" className="mt-6 inline-flex rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">Sign in</Link></div></main>;
  return <SettingsForm key={user._id || user.id || user.email} {...store} />;
}

function SettingsForm({ user, theme, setTheme, updateProfile, toast }) {
  const [form, setForm] = useState(() => ({ name: user.name || "", email: user.email || "", password: "" }));
  const [preferences, setPreferences] = useState(() => {
    try { return { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem("asim-settings") || "{}") }; }
    catch { return DEFAULT_PREFERENCES; }
  });
  const [saving, setSaving] = useState(false);

  const changePreference = (key) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    try {
      localStorage.setItem("asim-settings", JSON.stringify(next));
      toast("Your notification preferences are saved.", "success");
    } catch { toast("Could not save preferences in this browser.", "error"); }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setForm((current) => ({ ...current, password: "" }));
      toast("Your account details have been updated.", "success");
    } catch (error) { toast(error.message || "Could not update your account.", "error"); }
    finally { setSaving(false); }
  };

  return <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-12 sm:px-8"><header><p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-700 dark:text-violet-300">Your account</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1><p className="mt-2 text-sm text-black/55 dark:text-white/75">Manage your account details and store preferences.</p></header>
    <div className="mt-8 grid gap-5">
      <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7 dark:border-white/15 dark:bg-black"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><UserRound size={18}/></span><div><h2 className="font-semibold">Account details</h2><p className="mt-0.5 text-xs text-black/55">Update your name, email, or password.</p></div></div><form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium">Full name<input required autoComplete="name" value={form.name} onChange={(event)=>setForm({...form,name:event.target.value})} className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/15"/></label><label className="text-xs font-medium">Email address<input type="email" required autoComplete="email" value={form.email} onChange={(event)=>setForm({...form,email:event.target.value})} className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/15"/></label><label className="text-xs font-medium sm:col-span-2">New password <span className="font-normal text-black/55">(leave blank to keep current)</span><input type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(event)=>setForm({...form,password:event.target.value})} placeholder="At least 8 characters" className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/15"/></label><div className="sm:col-span-2"><button disabled={saving} className="rounded-full bg-violet-700 px-6 py-3 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50">{saving?"Saving...":"Save account details"}</button></div></form></section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7 dark:border-white/15 dark:bg-black"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">{theme === "dark" ? <Moon size={18}/> : <Sun size={18}/>}</span><div><h2 className="font-semibold">Appearance</h2><p className="mt-0.5 text-xs text-black/55">Choose the look you prefer across ASIAN STORE.</p></div></div><div className="mt-5 flex flex-wrap gap-3"><button onClick={()=>setTheme("light")} aria-pressed={theme === "light"} className={`rounded-full border px-5 py-2.5 text-xs font-medium transition ${theme === "light" ? "border-violet-700 bg-violet-50 text-violet-800 dark:border-violet-400 dark:bg-violet-950 dark:text-violet-100" : "border-black/10 dark:border-white/15"}`}><Sun className="mr-2 inline" size={14}/>Light</button><button onClick={()=>setTheme("dark")} aria-pressed={theme === "dark"} className={`rounded-full border px-5 py-2.5 text-xs font-medium transition ${theme === "dark" ? "border-violet-700 bg-violet-50 text-violet-800 dark:border-violet-400 dark:bg-violet-950 dark:text-violet-100" : "border-black/10 dark:border-white/15"}`}><Moon className="mr-2 inline" size={14}/>Dark</button></div></section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7 dark:border-white/15 dark:bg-black"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Bell size={18}/></span><div><h2 className="font-semibold">Notifications</h2><p className="mt-0.5 text-xs text-black/55">Choose which updates you want to receive.</p></div></div><div className="mt-4 divide-y divide-black/10 dark:divide-white/10">{[["orderUpdates","Order updates","Progress and delivery updates for your purchases."],["newArrivals","New arrivals","A note when a new collection is released."],["offers","Offers and stories","Occasional offers and news from ASIAN STORE."]].map(([key,title,description])=><label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs text-black/55">{description}</span></span><input type="checkbox" checked={Boolean(preferences[key])} onChange={()=>changePreference(key)} className="size-4 shrink-0 accent-violet-700"/></label>)}</div></section>
    </div>
  </main>;
}
