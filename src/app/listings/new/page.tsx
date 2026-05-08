"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/../convex/_generated/api";
import type { DonationStatus } from "@/domains/donations/Donation";
import { LocationPicker } from "@/ui/map/LocationPicker";

const categories = [
  "Devices",
  "Furniture",
  "Clothing",
  "Education",
  "Supplies",
];

const statusOptions: Array<{ label: string; value: DonationStatus }> = [
  { label: "Ready for pickup", value: "ready" },
  { label: "Verifier assigned", value: "assigned" },
  { label: "Requesting transport", value: "transport" },
  { label: "Pickup scheduled", value: "scheduled" },
];

export default function NewListingPage() {
  const router = useRouter();
  const createDonation = useMutation(api.donations.create);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.me);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [status, setStatus] = useState<DonationStatus>("ready");
  const [coordinator, setCoordinator] = useState("You");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me?.name && coordinator === "You") {
      setCoordinator(me.name);
      return;
    }
    if (me?.email && coordinator === "You") {
      setCoordinator(me.email);
    }
  }, [me, coordinator]);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  }, []);

  const handleReverseGeocode = useCallback(async (lat: number, lng: number) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=place,locality,neighborhood,address&language=en`,
      );
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const label = data?.features?.[0]?.place_name;
      if (label) {
        setLocation(label);
      }
    } catch {
      // Best-effort only; ignore geocoding errors.
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError(null);
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        setError(
          "Unable to access your location. Please allow location access.",
        );
      },
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }

    const latValue = latitude.trim();
    const lngValue = longitude.trim();
    if (!latValue || !lngValue) {
      setError("Please select a location on the map.");
      return;
    }

    const parsedLat = Number(latValue);
    const parsedLng = Number(lngValue);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    setIsSaving(true);
    try {
      const createdId = await createDonation({
        title: title.trim(),
        location: location.trim(),
        latitude: parsedLat,
        longitude: parsedLng,
        category,
        status,
        coordinator: coordinator.trim() || "Coordinator",
      });
      router.push(`/listings/${createdId}`);
    } catch (e) {
      setError("Unable to save the listing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            New listing
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Share a resource with your community.
          </h1>
        </div>
        <Link
          href="/listings"
          className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-sm text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
        >
          Back to listings
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 pb-16">
        {!isLoading && !isAuthenticated ? (
          <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
            <p>You need to sign in before creating a listing.</p>
            <Link
              href="/auth"
              className="text-xs font-semibold text-[var(--eco-moss)]"
            >
              Go to sign in →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-6 rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 shadow-sm md:grid-cols-2"
          >
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Listing title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
                placeholder="Ex: Student laptop bundle"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Location
              </label>
              <input
                value={location}
                readOnly
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/70 px-4 py-3 text-sm text-[var(--eco-forest)]/80"
                placeholder="Auto-filled from the map"
              />
            </div>
            <div className="grid gap-3 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                    Pin your location
                  </p>
                  <p className="text-xs text-[var(--eco-forest)]/60">
                    Use your current spot or click the map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
                >
                  Use my location
                </button>
              </div>
              <LocationPicker
                latitude={latitude ? Number(latitude) : undefined}
                longitude={longitude ? Number(longitude) : undefined}
                onChange={(lat, lng) => {
                  handleLocationChange(lat, lng);
                  void handleReverseGeocode(lat, lng);
                }}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Category
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Status
              </label>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as DonationStatus)
                }
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Coordinator name
              </label>
              <input
                value={coordinator}
                onChange={(event) => setCoordinator(event.target.value)}
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
                placeholder="Ex: Ariela M."
              />
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-dashed border-[var(--eco-sand)] bg-[var(--eco-mist)] p-4 text-xs text-[var(--eco-forest)]/70">
              <div>
                <p className="font-semibold text-[var(--eco-forest)]">
                  Demo note
                </p>
                <p className="mt-2">
                  Listings are saved in Convex. When you connect Avalanche, this
                  form can also trigger the on-chain verification flow.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--eco-forest)]">
                  Required fields
                </p>
                <p className="mt-1">
                  Title and map location are required. Coordinates are captured
                  from the map.
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              {error ? (
                <p className="text-sm text-[var(--eco-rust)]">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 w-full rounded-full bg-[var(--eco-moss)] px-4 py-3 text-sm font-semibold text-[var(--eco-base)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving listing..." : "Publish listing"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
