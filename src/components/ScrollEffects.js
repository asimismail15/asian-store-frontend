"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let context;
    let cancelled = false;
    const setupTimer = window.setTimeout(() => {
      import("gsap").then(async ({ gsap }) => {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {
          gsap.utils.toArray("main section:not(.hero-showcase-wrap), main .scroll-section, main .category-swatch, main > header, main > aside, footer").forEach((section) => {
            gsap.fromTo(section,
              { autoAlpha: 0, y: 26, rotateX: 1.2, transformPerspective: 1400 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.72,
                ease: "power3.out",
                clearProps: "transform",
                scrollTrigger: { trigger: section, start: "top 90%", once: true },
              },
            );
          });
        }, document.body);
      });
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(setupTimer);
      context?.revert();
    };
  }, [pathname]);

  return null;
}
