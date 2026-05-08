"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type LocationPickerProps = {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
};

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const didInitialFlyRef = useRef(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) {
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [120.9842, 14.5995],
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl({ showZoom: true }));

    map.on("click", (event) => {
      const { lng, lat } = event.lngLat;
      onChangeRef.current(lat, lng);
    });

    mapRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          onChangeRef.current(lat, lng);
        },
        () => undefined,
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || latitude == null || longitude == null) {
      return;
    }

    if (!markerRef.current) {
      const markerEl = document.createElement("div");
      markerEl.style.width = "20px";
      markerEl.style.height = "20px";
      markerEl.style.borderRadius = "999px";
      markerEl.style.background = "#2f6b4f";
      markerEl.style.boxShadow =
        "0 0 0 6px rgba(247, 243, 234, 0.85), 0 8px 18px rgba(31, 42, 36, 0.2)";
      markerEl.style.border = "2px solid #1d3b2a";

      markerRef.current = new mapboxgl.Marker({
        element: markerEl,
        draggable: true,
      })
        .setLngLat([longitude, latitude])
        .addTo(map)
        .on("dragend", () => {
          const position = markerRef.current?.getLngLat();
          if (position) {
            onChangeRef.current(position.lat, position.lng);
          }
        });
      if (!didInitialFlyRef.current) {
        map.flyTo({ center: [longitude, latitude], zoom: 14 });
        didInitialFlyRef.current = true;
      }
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude, onChange]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 p-4 text-xs text-[var(--eco-forest)]/70">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local to enable the location
        map.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 p-2">
      <div ref={containerRef} className="h-[260px] w-full rounded-[18px]" />
    </div>
  );
}
