"use client";

import Image from "next/image";
import { Move3D, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState } from "react";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export default function ProductInspectViewer({ image, alt, compact = false }) {
  const pointer = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function drag(event) {
    if (!pointer.current) return;
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    pointer.current = { x: event.clientX, y: event.clientY };
    setRotation((value) => ({ x: clamp(value.x - dy * 0.35, -24, 24), y: clamp(value.y + dx * 0.4, -28, 28) }));
  }

  function stopDrag(event) {
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function reset() {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  }

  return (
    <div className={`product-inspect ${compact ? "product-inspect-compact" : ""}`}>
      <div
        className={`product-inspect-stage ${dragging ? "is-dragging" : ""}`}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onWheel={(event) => { event.preventDefault(); setZoom((value) => clamp(value - Math.sign(event.deltaY) * 0.08, 0.72, 1.65)); }}
        onKeyDown={(event) => {
          const directions = { ArrowLeft: [0, -4], ArrowRight: [0, 4], ArrowUp: [-4, 0], ArrowDown: [4, 0] };
          if (!directions[event.key]) return;
          event.preventDefault();
          setRotation((value) => ({ x: clamp(value.x + directions[event.key][0], -24, 24), y: clamp(value.y + directions[event.key][1], -28, 28) }));
        }}
        role="group"
        tabIndex={0}
        aria-label="Drag or use arrow keys to tilt the product image; use the controls to zoom"
      >
        <div className="product-inspect-halo" aria-hidden="true" />
        <div className="product-inspect-frame" style={{ transform: `perspective(1100px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})` }}>
          {image ? <Image src={image} alt={alt} fill unoptimized draggable={false} sizes="(max-width: 640px) 90vw, 48vw" className="product-inspect-image" /> : <span className="text-7xl font-serif">A.</span>}
        </div>
        <div className="product-inspect-hint"><Move3D size={13} /> DRAG TO INSPECT</div>
      </div>
      <div className="product-inspect-controls" aria-label="Product view controls">
        <button type="button" onClick={() => setZoom((value) => clamp(value - 0.15, 0.72, 1.65))} aria-label="Zoom out"><ZoomOut size={15} /></button>
        <button type="button" onClick={reset} aria-label="Reset product view"><RotateCcw size={14} /></button>
        <button type="button" onClick={() => setZoom((value) => clamp(value + 0.15, 0.72, 1.65))} aria-label="Zoom in"><ZoomIn size={15} /></button>
      </div>
    </div>
  );
}
