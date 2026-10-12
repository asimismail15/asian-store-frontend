"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AmbientScene = dynamic(() => import("@/components/AmbientScene"), { ssr: false });

export default function StoreAmbience() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const enable = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(enable, { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(enable, 900);
    return () => window.clearTimeout(id);
  }, []);
  return ready ? <AmbientScene route={pathname} /> : null;
}
