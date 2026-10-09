import { LoaderCircle } from "lucide-react";

export default function LoadingState({ label = "Loading…" }) {
  return <div role="status" className="flex min-h-56 items-center justify-center gap-3 text-sm text-black/55 dark:text-white/75"><LoaderCircle className="animate-spin text-violet-500" size={20} /><span>{label}</span></div>;
}
