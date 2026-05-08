import type { Donation, DonationInput } from "@/domains/donations/Donation";
import type { DonationRepository } from "@/domains/donations/DonationRepository";

const mockDonations: Donation[] = [
  {
    id: "don-001",
    title: "Student laptop bundle",
    location: "Barangay 16, City Center",
    category: "Devices",
    status: "ready",
    coordinator: "Ariela M.",
    updatedAt: "Updated 2h ago",
  },
  {
    id: "don-002",
    title: "Community pantry shelves",
    location: "North Hills Hub",
    category: "Furniture",
    status: "scheduled",
    coordinator: "Jonas L.",
    updatedAt: "Pickup window Sat",
  },
  {
    id: "don-003",
    title: "Winter jackets (12)",
    location: "East River School",
    category: "Clothing",
    status: "assigned",
    coordinator: "Mae C.",
    updatedAt: "Verifier assigned",
  },
  {
    id: "don-004",
    title: "Reusable water bottles",
    location: "South Market",
    category: "Supplies",
    status: "transport",
    coordinator: "Ravi S.",
    updatedAt: "Requesting transport",
  },
  {
    id: "don-005",
    title: "Science kits (8 boxes)",
    location: "Greenwood Library",
    category: "Education",
    status: "ready",
    coordinator: "Mila V.",
    updatedAt: "Updated 1d ago",
  },
  {
    id: "don-006",
    title: "Office chairs (6)",
    location: "West Ridge Co-op",
    category: "Furniture",
    status: "assigned",
    coordinator: "Paolo R.",
    updatedAt: "Verifier on site",
  },
];

export const mockDonationRepository: DonationRepository = {
  list: async () => mockDonations,
  getById: async (id: string) =>
    mockDonations.find((donation) => donation.id === id) ?? null,
  create: async (input: DonationInput) => {
    const created: Donation = {
      id: `don-${Math.random().toString(36).slice(2, 8)}`,
      updatedAt: "Just now",
      ...input,
    };
    mockDonations.unshift(created);
    return created;
  },
};
