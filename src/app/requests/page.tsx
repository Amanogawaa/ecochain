"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/../convex/_generated/api";
import { MainNav } from "@/ui/navigation/MainNav";
import { LocationPicker } from "@/ui/map/LocationPicker";

const categories = [
  "Devices",
  "Furniture",
  "Clothing",
  "Education",
  "Supplies",
];

const statusTone: Record<string, string> = {
  pending: "text-[var(--eco-moss)]",
  approved: "text-[var(--eco-forest)]",
  fulfilled: "text-[var(--eco-forest)]",
  cancelled: "text-[var(--eco-rust)]",
};

export default function RequestsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.me);
  const requests = useQuery(api.requests.list) ?? [];
  const createRequest = useMutation(api.requests.create);
  const updateStatus = useMutation(api.requests.updateStatus);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
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

    try {
      await createRequest({
        title: title.trim(),
        location: location.trim(),
        latitude: parsedLat,
        longitude: parsedLng,
        category,
        details: details.trim() || undefined,
      });
      setTitle("");
      setLocation("");
      setLatitude("");
      setLongitude("");
      setDetails("");
    } catch (e) {
      setError("Unable to submit request.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <MainNav variant="app" subtitle="Requests" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-16">
        <section className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
            Requests
          </p>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
            Community needs board
          </h1>
        </section>
        {!isLoading && !isAuthenticated ? (
          <div className="rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 text-sm text-[var(--eco-forest)]/70">
            <p>You need to sign in before creating a request.</p>
            <Link
              href="/auth"
              className="text-xs font-semibold text-[var(--eco-moss)]"
            >
              Go to sign in →
            </Link>
          </div>
        ) : me?.role === "verifier" ? (
          <></>
        ) : (
          <form
            onSubmit={handleCreate}
            className="grid gap-6 rounded-[32px] border border-[var(--eco-sand)] bg-white/80 p-6 shadow-sm md:grid-cols-2"
          >
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                Need title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
                placeholder="Ex: School backpacks"
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
                Details (optional)
              </label>
              <input
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 px-4 py-3 text-sm text-[var(--eco-forest)] outline-none focus:border-[var(--eco-moss)]"
                placeholder="Ex: For community pantry"
              />
            </div>
            <div className="md:col-span-2">
              {error ? (
                <p className="text-sm text-[var(--eco-rust)]">{error}</p>
              ) : null}
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-[var(--eco-moss)] px-4 py-3 text-sm font-semibold text-[var(--eco-base)]"
              >
                Submit request
              </button>
            </div>
          </form>
        )}

        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-display)] text-2xl text-[var(--eco-forest)]">
              Active requests
            </h2>
            <span className="text-xs text-[var(--eco-forest)]/60">
              {requests.length} total
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((request) => {
              const canApprove =
                me?.role === "verifier" && request.status === "pending";
              const canCancel =
                request.requesterId === me?._id &&
                request.status !== "fulfilled";
              const canCreateMatchingListing =
                request.status === "approved" &&
                request.requesterId !== me?._id &&
                me?.role !== "verifier";

              return (
                <div
                  key={request._id}
                  className="rounded-2xl border border-[var(--eco-sand)] bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-[var(--eco-forest)]">
                        {request.title}
                      </p>
                      <p className="text-xs text-[var(--eco-forest)]/60">
                        Requested by{" "}
                        {request.requester?.name ??
                          request.requester?.email ??
                          "a community member"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-xs text-[var(--eco-forest)]">
                      Need: {request.category}
                    </span>
                  </div>
                  <p
                    className={`mt-3 text-xs font-semibold ${statusTone[request.status]}`}
                  >
                    {request.status === "pending"
                      ? "Waiting for approval"
                      : request.status === "approved"
                        ? "Waiting for a donor"
                        : request.status === "fulfilled"
                          ? "Matched with a donation"
                          : "Cancelled"}
                  </p>
                  {request.details ? (
                    <p className="mt-2 text-xs text-[var(--eco-forest)]/70">
                      {request.details}
                    </p>
                  ) : null}
                  {request.fulfilledByDonationId ? (
                    <p className="mt-2 text-xs text-[var(--eco-moss)]">
                      This request has been donated to.
                    </p>
                  ) : request.status === "approved" ? (
                    <p className="mt-2 text-xs text-[var(--eco-forest)]/60">
                      Approved and waiting for someone to donate to this
                      requester.
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {canCreateMatchingListing ? (
                      <Link
                        href={`/listings/new?requestId=${request._id}`}
                        className="rounded-full border border-[var(--eco-moss)]/40 px-3 py-1 text-[var(--eco-moss)]"
                      >
                        Donate to requester
                      </Link>
                    ) : null}
                    {canApprove ? (
                      <button
                        onClick={() =>
                          void updateStatus({
                            id: request._id,
                            status: "approved",
                          })
                        }
                        className="rounded-full border border-[var(--eco-forest)]/20 px-3 py-1 text-[var(--eco-forest)]"
                      >
                        Approve
                      </button>
                    ) : null}
                    {canCancel ? (
                      <button
                        onClick={() =>
                          void updateStatus({
                            id: request._id,
                            status: "cancelled",
                          })
                        }
                        className="rounded-full border border-[var(--eco-rust)]/50 px-3 py-1 text-[var(--eco-rust)]"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
