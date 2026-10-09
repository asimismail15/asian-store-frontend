"use client";

import { useMemo } from "react";
import { CircleDollarSign, PackageCheck, UsersRound, ShoppingBasket } from "lucide-react";

const usd = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

function lastMonths(count = 6) {
  const months = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, label: date.toLocaleDateString(undefined, { month: "short" }) });
  }
  return months;
}

function BarChart({ title, data, valueKey, format = (value) => value, color = "#6d28d9" }) {
  const peak = Math.max(1, ...data.map((item) => item[valueKey] || 0));
  return <section className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-black"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs text-black/55 dark:text-white/75">Last six months</p></div><span className="size-2.5 rounded-full" style={{ backgroundColor: color }} /></div><div className="mt-6 flex h-40 items-end gap-2 sm:gap-4">{data.map((item) => { const value = item[valueKey] || 0; const height = value ? Math.max(8, value / peak * 100) : 2; return <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="w-full rounded-t-md transition-all duration-500" title={format(value)} style={{ height: `${height}%`, backgroundColor: color, opacity: value ? 0.9 : 0.15 }} /><span className="text-[10px] text-black/55 dark:text-white/75">{item.label}</span></div>; })}</div><div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-[10px] text-black/55 dark:border-white/15"><span>{format(0)}</span><span>Peak {format(peak)}</span></div></section>;
}

export default function AdminAnalytics({ metrics }) {
  const months = useMemo(() => lastMonths(), []);
  const salesData = months.map((month) => ({ ...month, revenue: metrics?.monthlySales?.find((entry) => entry._id === month.key)?.revenue || 0 }));
  const userData = months.map((month) => ({ ...month, users: metrics?.monthlyUsers?.find((entry) => entry._id === month.key)?.users || 0 }));
  const statuses = metrics?.ordersByStatus || [];
  const maxStatus = Math.max(1, ...statuses.map((entry) => entry.count));
  const cards = [
    { label: "Paid revenue", value: usd(metrics?.paidRevenue), detail: "Successfully paid orders", Icon: CircleDollarSign, tint: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
    { label: "Orders", value: metrics?.totalOrders ?? "—", detail: "All order statuses", Icon: ShoppingBasket, tint: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
    { label: "Customers", value: metrics?.totalUsers ?? "—", detail: "Registered accounts", Icon: UsersRound, tint: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
    { label: "Products", value: metrics?.totalProducts ?? "—", detail: "In the catalog", Icon: PackageCheck, tint: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  ];
  return <section className="mt-7" aria-label="Store analytics"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, detail, Icon, tint }) => <article key={label} className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-black"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-black/55 dark:text-white/75">{label}</p><span className={`grid size-9 place-items-center rounded-xl ${tint}`}><Icon size={18} /></span></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-black/55 dark:text-white/75">{detail}</p></article>)}</div><div className="mt-4 grid gap-4 lg:grid-cols-2"><BarChart title="Paid sales" data={salesData} valueKey="revenue" format={usd} /><BarChart title="New customers" data={userData} valueKey="users" format={(value) => value} color="#6d28d9" /></div><section className="mt-4 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-black"><h3 className="font-semibold">Orders by status</h3>{statuses.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2">{statuses.map((entry) => <div key={entry._id}><div className="mb-1.5 flex justify-between text-xs"><span>{entry._id}</span><span className="font-semibold">{entry.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-white dark:bg-black"><div className="h-full rounded-full bg-violet-400" style={{ width: `${entry.count / maxStatus * 100}%` }} /></div></div>)}</div> : <p className="mt-3 text-sm text-black/55">No orders to chart yet.</p>}</section></section>;
}
