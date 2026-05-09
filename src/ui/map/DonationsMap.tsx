"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { DonationStatus } from "@/domains/donations/Donation";
import "mapbox-gl/dist/mapbox-gl.css";

type DonationMarker = {
  _id: string;
  title: string;
  location: string;
  status: DonationStatus;
  latitude?: number;
  longitude?: number;
};

type RequestMarker = {
  _id: string;
  title: string;
  location: string;
  status: "pending" | "approved" | "fulfilled" | "cancelled";
  latitude?: number;
  longitude?: number;
  category: string;
  details?: string | null;
  requester?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type DonationsMapProps = {
  variant?: "default" | "embed";
  className?: string;
};

const statusColor: Record<DonationStatus, string> = {
  ready: "#2f6b4f",
  assigned: "#1d3b2a",
  transport: "#b97a5a",
  scheduled: "#9bb89b",
};

const requestColor: Record<RequestMarker["status"], string> = {
  pending: "#9aa18f",
  approved: "#d19d57",
  fulfilled: "#2f6b4f",
  cancelled: "#c86d57",
};

export function DonationsMap({
  variant = "default",
  className,
}: DonationsMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const donations = useQuery(api.donations.list) ?? [];
  const requests = useQuery(api.requests.list) ?? [];
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

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
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasBounds = false;

    donations.forEach((donation: DonationMarker) => {
      if (donation.latitude == null || donation.longitude == null) {
        return;
      }

      const markerEl = document.createElement("div");
      markerEl.style.width = "16px";
      markerEl.style.height = "16px";
      markerEl.style.borderRadius = "999px";
      markerEl.style.background = statusColor[donation.status];
      markerEl.style.boxShadow = "0 0 0 4px rgba(255, 255, 255, 0.8)";

      const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
        `<strong>${donation.title}</strong><br/>${donation.location}`,
      );

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([donation.longitude, donation.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([donation.longitude, donation.latitude]);
      hasBounds = true;
    });

    requests
      .filter((request: RequestMarker) => request.status === "approved")
      .forEach((request: RequestMarker) => {
        if (request.latitude == null || request.longitude == null) {
          return;
        }

        const markerEl = document.createElement("div");
        markerEl.style.width = "16px";
        markerEl.style.height = "16px";
        markerEl.style.borderRadius = "999px";
        markerEl.style.background = requestColor[request.status];
        markerEl.style.boxShadow = "0 0 0 4px rgba(255, 255, 255, 0.8)";

        const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
          `<strong>${request.title}</strong><br/>${request.location}<br/><small>Need: ${request.category}</small><br/><small>Recipient: ${request.requester?.name ?? request.requester?.email ?? "the requester"}</small>`,
        );

        const marker = new mapboxgl.Marker({ element: markerEl })
          .setLngLat([request.longitude, request.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
        bounds.extend([request.longitude, request.latitude]);
        hasBounds = true;
      });

    if (hasBounds) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
  }, [donations, requests]);

  if (!token) {
    return (
      <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local to display the map.
      </div>
    );
  }

  const mapClassName =
    variant === "embed"
      ? `h-full min-h-[280px] w-full rounded-[24px] ${className ?? ""}`
      : `h-[480px] w-full rounded-[28px] ${className ?? ""}`;

  if (variant === "embed") {
    return <div ref={containerRef} className={mapClassName} />;
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/70 p-2 shadow-sm">
        <div ref={containerRef} className={mapClassName} />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-[var(--eco-forest)]/70">
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: statusColor.ready }}
          />
          Ready
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: statusColor.assigned }}
          />
          Assigned
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: statusColor.transport }}
          />
          Transport
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: statusColor.scheduled }}
          />
          Scheduled
        </span>
      </div>
    </div>
  );
}
