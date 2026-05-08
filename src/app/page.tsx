import Link from "next/link";
import { AuthStatus } from "@/ui/auth/AuthStatus";

const highlights = [
  {
    label: "Verified donations",
    value: "312",
    note: "Anchored to Avalanche records",
  },
  { label: "Items rescued", value: "1.4k", note: "Books, gadgets, kits" },
  { label: "Neighborhoods", value: "8", note: "Shared impact hubs" },
];

const steps = [
  {
    title: "List or request",
    description:
      "Create a listing for items ready to share or submit a need for supplies.",
  },
  {
    title: "Match locally",
    description:
      "Community hubs coordinate pickup and delivery with clear visibility.",
  },
  {
    title: "Verify and record",
    description:
      "Volunteers confirm handoffs and log proof on Avalanche later.",
  },
];

const listings = [
  {
    title: "Student laptop bundle",
    location: "Barangay 16, City Center",
    status: "Ready for pickup",
    category: "Devices",
  },
  {
    title: "Community pantry shelves",
    location: "North Hills Hub",
    status: "Pickup window: Sat",
    category: "Furniture",
  },
  {
    title: "Winter jackets (12)",
    location: "East River School",
    status: "Verifier assigned",
    category: "Clothing",
  },
  {
    title: "Reusable water bottles",
    location: "South Market",
    status: "Requesting transport",
    category: "Supplies",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="eco-backdrop pointer-events-none absolute inset-0 opacity-95" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--eco-sand)] bg-[var(--eco-mist)] text-sm font-semibold text-[var(--eco-forest)]">
            EC
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm uppercase tracking-[0.2em] text-[var(--eco-moss)]">
              EcoChain
            </span>
            <span className="text-xs text-[var(--eco-forest)]/70">
              Chain for Change
            </span>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-[var(--eco-forest)]/80 md:flex">
          <a
            href="#impact"
            className="transition hover:text-[var(--eco-forest)]"
          >
            Impact
          </a>
          <Link
            href="/map"
            className="transition hover:text-[var(--eco-forest)]"
          >
            Map
          </Link>
          <a
            href="#listings"
            className="transition hover:text-[var(--eco-forest)]"
          >
            Listings
          </a>
          <a
            href="#process"
            className="transition hover:text-[var(--eco-forest)]"
          >
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="rounded-full border border-[var(--eco-forest)]/20 px-4 py-2 text-xs font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
          >
            Notifications
          </Link>
          <Link
            href="/listings/new"
            className="rounded-full border border-[var(--eco-forest)]/15 bg-[var(--eco-forest)] px-4 py-2 text-sm font-semibold text-[var(--eco-base)] shadow-sm transition hover:translate-y-[-1px]"
          >
            Start a listing
          </Link>
          <AuthStatus />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 pb-20 pt-6">
        <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--eco-sand)] bg-[var(--eco-mist)] px-4 py-1 text-xs uppercase tracking-[0.25em] text-[var(--eco-forest)]">
              verified sustainability
            </div>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-[var(--eco-forest)] sm:text-5xl">
              Transparent sharing for a community that wastes less.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--eco-forest)]/70">
              EcoChain helps neighborhoods list reusable resources, match needs
              fast, and verify handoffs with community trust. The blockchain
              layer comes later. The impact starts today.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-[var(--eco-moss)] px-6 py-3 text-sm font-semibold text-[var(--eco-base)] shadow-sm transition hover:translate-y-[-1px]">
                Post a donation
              </button>
              <Link
                href="/listings"
                className="rounded-full border border-[var(--eco-forest)]/20 px-6 py-3 text-sm font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
              >
                Browse listings
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-2xl border border-[var(--eco-sand)] bg-[var(--eco-base)]/80 p-4 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                    {highlight.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--eco-forest)]">
                    {highlight.value}
                  </p>
                  <p className="mt-1 text-xs text-[var(--eco-forest)]/70">
                    {highlight.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[32px] border border-[var(--eco-sand)] bg-[var(--eco-base)]/90 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/70">
                  live exchange
                </span>
                <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-xs text-[var(--eco-forest)]">
                  4 hubs active
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {listings.slice(0, 3).map((listing) => (
                  <div
                    key={listing.title}
                    className="rounded-2xl border border-[var(--eco-sand)]/80 bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--eco-forest)]">
                          {listing.title}
                        </p>
                        <p className="text-xs text-[var(--eco-forest)]/60">
                          {listing.location}
                        </p>
                      </div>
                      <span className="rounded-full border border-[var(--eco-sage)] px-2 py-1 text-xs text-[var(--eco-forest)]/70">
                        {listing.category}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--eco-forest)]/70">
                      {listing.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-[var(--eco-sage)]/40 blur-2xl" />
          </div>
        </section>

        <section id="process" className="grid gap-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--eco-forest)]/60">
                how it works
              </p>
              <h2 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
                Designed for real community flow
              </h2>
            </div>
            <p className="max-w-md text-sm text-[var(--eco-forest)]/70">
              Keep everything off-chain while the community operates. Record
              only verified handoffs when you are ready to deploy.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-[var(--eco-sand)] bg-[var(--eco-base)]/80 p-5 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-forest)]/60">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[var(--eco-forest)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--eco-forest)]/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="listings" className="grid gap-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--eco-forest)]/60">
                listings
              </p>
              <h2 className="mt-2 font-[var(--font-display)] text-3xl text-[var(--eco-forest)]">
                Live resource exchange
              </h2>
            </div>
            <Link
              href="/listings"
              className="rounded-full border border-[var(--eco-forest)]/20 px-5 py-2 text-sm font-semibold text-[var(--eco-forest)] transition hover:bg-[var(--eco-mist)]"
            >
              View all listings
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <div
                key={listing.title}
                className="group rounded-2xl border border-[var(--eco-sand)] bg-white/70 p-5 shadow-sm transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-[var(--eco-forest)]">
                      {listing.title}
                    </p>
                    <p className="text-xs text-[var(--eco-forest)]/60">
                      {listing.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--eco-mist)] px-3 py-1 text-xs text-[var(--eco-forest)]">
                    {listing.category}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--eco-forest)]/70">
                  <span>{listing.status}</span>
                  <span className="text-[var(--eco-moss)]">
                    Coordinator online
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="impact"
          className="rounded-[32px] border border-[var(--eco-sand)] bg-[var(--eco-forest)] px-6 py-10 text-[var(--eco-base)] md:px-10"
        >
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--eco-base)]/70">
                impact log
              </p>
              <h2 className="mt-3 font-[var(--font-display)] text-3xl">
                Every verified exchange becomes a public proof.
              </h2>
              <p className="mt-3 text-sm text-[var(--eco-base)]/80">
                When you are ready for Avalanche, EcoChain writes a simple proof
                hash for every verified donation. This keeps the demo fast today
                and blockchain-ready tomorrow.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--eco-base)]/70">
                next verification
              </p>
              <p className="mt-3 text-lg font-semibold">
                Barangay 16 donation bundle
              </p>
              <p className="mt-1 text-sm text-[var(--eco-base)]/80">
                Awaiting volunteer confirmation
              </p>
              <button className="mt-6 w-full rounded-full bg-[var(--eco-base)] px-4 py-2 text-sm font-semibold text-[var(--eco-forest)] transition hover:translate-y-[-1px]">
                Verify handoff
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[var(--eco-sand)]/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-[var(--eco-forest)]/70 md:flex-row md:items-center md:justify-between">
          <p>EcoChain demo build for TechFest Hackathon.</p>
          <div className="flex items-center gap-4">
            <span>Fuji-ready</span>
            <span>Convex-ready</span>
            <span>Community-first</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
