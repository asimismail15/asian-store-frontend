const STEPS = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];

function activeStep(status = "Pending") {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return 4;
  if (normalized === "out for delivery") return 3;
  if (normalized === "shipped") return 2;
  if (normalized === "processing" || normalized === "packed") return 1;
  return 0;
}

export default function OrderStatusTimeline({ order }) {
  if (order.status?.toLowerCase() === "cancelled") return <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-200">This order was cancelled.</p>;
  const current = activeStep(order.status);
  const progress = current / (STEPS.length - 1) * 100;
  return <div className="mt-5" aria-label={`Order status: ${order.status || "Pending"}`}>
    <div className="relative grid grid-cols-5">
      <div className="absolute left-[10%] right-[10%] top-[10px] h-0.5 bg-black/10 dark:bg-white/15"><div className="h-full bg-violet-600 transition-all duration-500 dark:bg-violet-300" style={{ width: `${progress}%` }} /></div>
      {STEPS.map((step, index) => <div key={step} className="relative flex flex-col items-center text-center"><span className={`z-10 grid size-[21px] place-items-center rounded-full border-2 text-[9px] font-bold ${index <= current ? "border-violet-600 bg-violet-600 text-white dark:border-violet-300 dark:bg-violet-300 dark:text-black" : "border-black/10 bg-white text-transparent dark:border-white/15 dark:bg-black"}`} aria-current={index === current ? "step" : undefined}>{index < current ? "✓" : "•"}</span><span className={`mt-2 max-w-16 text-[9px] leading-3 sm:max-w-none sm:text-[11px] ${index <= current ? "font-semibold text-black dark:text-white/75" : "text-black/55 dark:text-white/45"}`}>{step}</span></div>)}
    </div>
  </div>;
}
