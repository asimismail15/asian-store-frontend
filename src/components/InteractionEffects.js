"use client";

import { useEffect } from "react";

export default function InteractionEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion) return;
    const rippleTimers = new WeakMap();
    let pendingPointerEvent = null;
    let pointerFrame = 0;

    const updatePointerEffects = () => {
      pointerFrame = 0;
      const event = pendingPointerEvent;
      pendingPointerEvent = null;
      if (!event || !(event.target instanceof Element)) return;

      const buttonTarget = event.target.closest("button:not(:disabled), a[href], .lux-cta");
      if (buttonTarget && !buttonTarget.matches(".action-feedback-host")) {
        const rect = buttonTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        buttonTarget.classList.add("magnetic-active");
        buttonTarget.style.translate = `${x * (buttonTarget.matches("a[href]") ? 3 : 5)}px ${y * (buttonTarget.matches("a[href]") ? 2 : 4)}px`;
        return;
      }

      const tiltTarget = event.target.closest(
        ".category-swatch, footer .lux-social-link, main article:not(.lux-product), main aside, main section.scroll-section:not(.hero-showcase-wrap):not(.hero-showcase)",
      );
      if (tiltTarget) {
        const rect = tiltTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const broadSurface = tiltTarget.matches("main section.scroll-section, main aside");
        const tilt = broadSurface ? 1.2 : 7;
        const lift = broadSurface ? 0 : -3;
        tiltTarget.style.transform = `perspective(1000px) rotateX(${y * -tilt}deg) rotateY(${x * tilt}deg) translateY(${lift}px)`;
        tiltTarget.classList.add("is-3d-hover");
        return;
      }
    };

    const onPointerMove = (event) => {
      if (coarsePointer || event.pointerType !== "mouse") return;
      pendingPointerEvent = event;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updatePointerEffects);
    };

    const onPointerOut = (event) => {
      if (!(event.target instanceof Element)) return;
      const tiltTarget = event.target.closest(
        ".category-swatch, footer .lux-social-link, main article:not(.lux-product), main aside, main section.scroll-section:not(.hero-showcase-wrap):not(.hero-showcase)",
      );
      if (tiltTarget && !tiltTarget.contains(event.relatedTarget)) {
        tiltTarget.style.transform = "";
        tiltTarget.classList.remove("is-3d-hover");
      }
      const target = event.target.closest("button, a[href], .lux-cta");
      if (!target || target.contains(event.relatedTarget)) return;
      target.style.translate = "";
      target.classList.remove("magnetic-active");
    };

    const onClick = (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest("button:not(:disabled), a[href], .lux-cta");
      if (!target) return;
      if (target.matches(".action-feedback-host")) return;
      if (target.matches(".action-particle-trigger")) {
        target.querySelector(".action-burst")?.remove();
        const burst = document.createElement("span");
        burst.className = "action-burst action-burst-cart action-burst-overlay";
        burst.setAttribute("aria-hidden", "true");
        const rect = target.getBoundingClientRect();
        burst.style.left = `${rect.left}px`;
        burst.style.top = `${rect.top}px`;
        burst.style.width = `${rect.width}px`;
        burst.style.height = `${rect.height}px`;
        for (let index = 0; index < 8; index += 1) {
          const particle = document.createElement("i");
          particle.style.setProperty("--burst-angle", `${index * 45}deg`);
          particle.style.setProperty("--burst-delay", `${index * 16}ms`);
          burst.append(particle);
        }
        document.body.append(burst);
        target.classList.remove("is-action-bursting");
        void target.offsetWidth;
        target.classList.add("is-action-bursting");
        window.setTimeout(() => {
          burst.remove();
          target.classList.remove("is-action-bursting");
        }, 850);
        return;
      }
      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 1.8;
      target.classList.add("has-interaction-ripple");
      const x = event.detail === 0 ? rect.width / 2 : event.clientX - rect.left;
      const y = event.detail === 0 ? rect.height / 2 : event.clientY - rect.top;
      target.style.setProperty("--ripple-size", `${diameter}px`);
      target.style.setProperty("--ripple-x", `${x - diameter / 2}px`);
      target.style.setProperty("--ripple-y", `${y - diameter / 2}px`);
      target.classList.remove("is-rippling");
      void target.offsetWidth;
      target.classList.add("is-rippling");
      window.clearTimeout(rippleTimers.get(target));
      rippleTimers.set(target, window.setTimeout(() => target.classList.remove("is-rippling"), 650));
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("click", onClick);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    };
  }, []);

  return null;
}
