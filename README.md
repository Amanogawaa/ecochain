# EcoChain

EcoChain is a community resource-sharing platform that helps people donate reusable items, request needed supplies, coordinate local handoffs, and verify exchanges with an Avalanche-compatible proof flow.

The app combines:
- **Next.js (App Router)** for the frontend
- **Convex** for realtime backend data and auth
- **Mapbox GL** for location-based listings and requests
- **Avalanche Fuji / ethers.js** for verifiable handoff records

---

## What this repository is about

This project is a sustainability-focused exchange system for communities:
- People can **post donations** (items available to give away).
- People can **post requests** (items needed).
- Donors and claimants can **confirm handoffs**.
- A **verifier role** can review edge cases and finalize trust signals.
- Verified handoffs can be **recorded with blockchain proof metadata**.

The goal is transparent, low-friction, local resource circulation with auditable verification.

---

## Core features

### 1) Donation listings
- Create listings with title, category, coordinator, and geolocation.
- Browse all active listings.
- Open listing detail pages to claim and manage handoff flow.

### 2) Request board
- Create community requests with geolocation.
- Verifiers can approve requests.
- Donors can fulfill approved requests by creating linked donations.

### 3) Claim + handoff lifecycle
- A user claims a listing.
- Listing owner approves one claim.
- Owner and claimant both confirm the handoff (with optional GPS).
- If geofence checks pass, the claim can be auto-verified.
- If GPS is missing/out of range, claim is flagged for verifier review.

### 4) Verifier dashboard
- View claims that need manual review.
- Mark claims as verified or rejected.
- Trigger on-chain verification flow for verified handoffs.

### 5) Notifications
- In-app notification feed for listing, claim, request, and verification events.

### 6) Community map
- Visual map of donation listings and approved requests using Mapbox.

---

## Roles

Two user roles exist:
- **user**: creates requests/listings, claims listings, confirms handoffs.
- **verifier**: reviews flagged handoffs, approves requests, verifies claims.

Role assignment is handled during sign-up and stored in Convex user records.

---

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend / data:** Convex
- **Auth:** `@convex-dev/auth` + password provider (Google provider scaffolded)
- **Blockchain:** Solidity contract (`contract/EcoChain.sol`), `ethers`
- **Maps / geocoding:** Mapbox GL + Mapbox Geocoding API

---

## Project structure

```text
.
├── src/
│   ├── app/                 # Next.js routes (home, listings, requests, map, auth, verifications)
│   ├── ui/                  # UI components (donations, map, navigation, notifications, auth)
│   ├── domains/             # Domain types/contracts
│   ├── application/         # Application-level use cases
│   ├── infrastructure/      # Repository implementations (mock)
│   └── lib/                 # Shared helpers (blockchain helper)
├── convex/                  # Convex schema, queries, mutations, auth config
├── contract/                # Solidity smart contract + deployed contract address
└── docs/                    # Product overview and context
```

---

## Data model (Convex)

Main tables:
- `users`
- `donations`
- `claims`
- `requests`
- `notifications`

Notable claim verification fields:
- `ownerConfirmedAt`, `claimantConfirmedAt`
- `ownerConfirmLocation`, `claimantConfirmLocation`
- `needsReview`, `reviewStatus`, `reviewedBy`
- `txHash`, `chainId`, `blockNumber`, `verifiedAtOnChain`

---

## Environment variables

Create a `.env.local` (frontend) and set the required variables:

```bash
NEXT_PUBLIC_CONVEX_URL=
CONVEX_SITE_URL=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_ECOCHAIN_CONTRACT_ADDRESS=
NEXT_PUBLIC_AVALANCHE_FUJI_RPC=
ECOCHAIN_SIGNER_PRIVATE_KEY=
NEXT_PUBLIC_FUJI_EXPLORER=https://testnet.snowscan.xyz
```

Notes:
- Map pages/components require `NEXT_PUBLIC_MAPBOX_TOKEN`.
- On-chain writes require contract/RPC/signer values.
- If blockchain credentials are unavailable, parts of the flow may use simulated proof behavior.

---

## Getting started

### Prerequisites
- Node.js 20+
- npm
- Convex project/environment configured
- Mapbox token (for map + reverse geocoding)

### Install dependencies

```bash
npm install
```

### Run locally

In one terminal (Convex backend):

```bash
npx convex dev
```

In another terminal (Next.js app):

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Scripts

```bash
npm run dev     # start Next.js dev server
npm run build   # production build
npm run start   # start production server
npm run lint    # run ESLint
```

---

## Smart contract

- Contract source: `contract/EcoChain.sol`
- Stores `VerifiedHandoff` records (`claimId`, `donationId`, verifier, timestamp)
- Includes helpers to read by ID and latest record
- Current address (repo): `contract/ecochain-address.txt`

---

## Current status and caveats

- This repository already contains a functional end-to-end product flow.
- Some UX elements are demo-focused and include fallback/simulated blockchain proof behavior.
- Existing lint/build issues may appear depending on local environment and connectivity (for example, Google Fonts fetch during build).

---

## License

No explicit license file is currently present in this repository. Add one if you plan to distribute or open-source formally.
