"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";

export default function DeliveryMap({ order }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [watching, setWatching] = useState(false);
  const watchId = useRef(null);
  useEffect(() => () => {
    if (watchId.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
  }, []);
  const shipping = order.shippingAddress || {};
  const destination = [shipping.address, shipping.city, shipping.postalCode, shipping.country].filter(Boolean).join(", ");
  if (!destination) return null;

  const encodedDestination = encodeURIComponent(destination);
  const mapId = `delivery-map-${order._id}`;
  const encodedOrigin = position ? encodeURIComponent(`${position.latitude},${position.longitude}`) : "";
  const mapSource = position
    ? `https://maps.google.com/maps?saddr=${encodedOrigin}&daddr=${encodedDestination}&output=embed`
    : `https://maps.google.com/maps?q=${encodedDestination}&output=embed`;

  function toggleLiveLocation() {
    if (watching) {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setWatching(false);
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Live location is not available in this browser.");
      return;
    }
    setLocationError("");
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => setPosition({ latitude: coords.latitude, longitude: coords.longitude }),
      () => { setLocationError("Location access was unavailable. Check your browser permission and try again."); setWatching(false); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    setWatching(true);
  }

  return <section className="mt-5 border-t border-black/10 pt-4 dark:border-white/15">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><MapPin size={16} className="text-violet-700 dark:text-violet-300" /><div><h3 className="text-xs font-semibold">Delivery destination</h3><p className="mt-1 text-[11px] text-black/55 dark:text-white/65">{destination}</p></div></div>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={mapId} className="rounded-full border border-violet-300 px-4 py-2 text-[10px] font-semibold text-violet-800 transition hover:bg-violet-50 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/50">{open ? "Hide map" : "View map"}</button>
    </div>
    {open && <div id={mapId} className="mt-4 overflow-hidden rounded-xl border border-black/10 dark:border-white/15">
      <iframe title={`Map route to delivery destination for order ${String(order._id).slice(-8)}`} src={mapSource} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full border-0 sm:h-80" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 bg-white p-3 dark:border-white/15 dark:bg-black">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={toggleLiveLocation} className="inline-flex items-center gap-1.5 rounded-full bg-violet-700 px-3 py-2 text-[10px] font-semibold text-white dark:bg-violet-300 dark:text-black"><Navigation size={12}/>{watching ? "Stop live location" : "Use my live location"}</button>
          <p className="text-[10px] text-black/55 dark:text-white/65">{position ? "Map route updates from your device location. Carrier GPS is not connected." : "Interactive destination map. Enable location to preview your route."}</p>
        </div>
        <a href={position ? `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}` : `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-violet-700 hover:underline dark:text-violet-300">Open directions <ExternalLink size={12} /></a>
        {locationError && <p role="status" className="basis-full text-[10px] text-violet-700 dark:text-violet-300">{locationError}</p>}
      </div>
    </div>}
  </section>;
}
