import Link from "next/link";
import type { Donation } from "@/domains/donations/Donation";

const statusMeta: Record<Donation["status"], { label: string; tone: string }> =
  {
    ready: { label: "Ready for pickup", tone: "text-[var(--eco-moss)]" },
    assigned: { label: "Verifier assigned", tone: "text-[var(--eco-forest)]" },
    transport: {
      label: "Requesting transport",
      tone: "text-[var(--eco-rust)]",
    },
    scheduled: { label: "Pickup scheduled", tone: "text-[var(--eco-forest)]" },
  };

type DonationCardProps = {
  donation: Donation;
};

export function DonationCard({ donation }: DonationCardProps) {
  const meta = statusMeta[donation.status];

  return (
    <Link
      href={`/listings/${donation.id}`}
      className="group rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-5 shadow-sm transition hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-[var(--eco-forest)]">
            {donation.title}
          </p>
          <p className="text-xs text-[var(--eco-forest)]/60">
            {donation.location}
          </p>
        </div>
        <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-xs text-[var(--eco-forest)]">
          {donation.category}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={meta.tone}>{meta.label}</span>
        <span className="text-[var(--eco-forest)]/60">
          {donation.updatedAt}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--eco-forest)]/60">
        <span>Coordinator</span>
        <span className="text-[var(--eco-forest)]">{donation.coordinator}</span>
      </div>
      {donation.request?.requester ? (
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--eco-forest)]/60">
          <span>For</span>
          <span className="text-[var(--eco-forest)]">
            {donation.request.requester.name ??
              donation.request.requester.email ??
              "the requester"}
          </span>
        </div>
      ) : null}
      <div className="mt-4 text-xs font-semibold text-[var(--eco-moss)]">
        View details →
      </div>
    </Link>
  );
}
