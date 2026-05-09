"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { DonationStatus } from "@/domains/donations/Donation";
import { DonationCard } from "@/ui/donations/DonationCard";

const filters = [
  "All",
  "Devices",
  "Furniture",
  "Clothing",
  "Education",
  "Supplies",
];

const statusFilters: Array<{ label: string; value: DonationStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Ready", value: "ready" },
  { label: "Assigned", value: "assigned" },
  { label: "Transport", value: "transport" },
  { label: "Scheduled", value: "scheduled" },
];

export type ConvexDonation = {
  _id: string;
  title: string;
  location: string;
  category: string;
  status: DonationStatus;
  coordinator: string;
  updatedAt: string;
  request?: {
    id: string;
    title: string;
    requester: {
      id: string;
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

type ListingsClientProps = {
  donations?: ConvexDonation[];
};

export function ListingsClient({ donations }: ListingsClientProps) {
  const queried = useQuery(api.donations.list);
  const resolved = donations ?? queried ?? [];
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState<DonationStatus | "all">(
    "all",
  );

  const filteredDonations = useMemo(() => {
    return resolved.filter((donation: ConvexDonation) => {
      const categoryMatch =
        activeCategory === "All" || donation.category === activeCategory;
      const statusMatch =
        activeStatus === "all" || donation.status === activeStatus;
      return categoryMatch && statusMatch;
    });
  }, [resolved, activeCategory, activeStatus]);

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter === activeCategory;
            return (
              <button
                key={filter}
                onClick={() => setActiveCategory(filter)}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  isActive
                    ? "border-[var(--eco-forest)]/30 bg-[var(--eco-forest)] text-[var(--eco-base)]"
                    : "border-[var(--eco-sand)] bg-white/60 text-[var(--eco-forest)]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => {
            const isActive = status.value === activeStatus;
            return (
              <button
                key={status.label}
                onClick={() => setActiveStatus(status.value)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  isActive
                    ? "border-[var(--eco-forest)]/30 bg-[var(--eco-forest)] text-[var(--eco-base)]"
                    : "border-[var(--eco-sand)] bg-[var(--eco-mist)] text-[var(--eco-forest)]/70"
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDonations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--eco-sand)] p-6 text-sm text-[var(--eco-forest)]/70">
            No listings match this view yet. Try resetting your filters.
          </div>
        ) : (
          filteredDonations.map((donation: ConvexDonation) => (
            <DonationCard
              key={donation._id}
              donation={{
                id: donation._id,
                title: donation.title,
                location: donation.location,
                category: donation.category,
                status: donation.status,
                coordinator: donation.coordinator,
                updatedAt: donation.updatedAt,
                request: donation.request,
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
