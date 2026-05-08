export type DonationStatus = "ready" | "assigned" | "transport" | "scheduled";

export type DonationInput = {
  title: string;
  location: string;
  category: string;
  status: DonationStatus;
  coordinator: string;
};

export type Donation = {
  id: string;
  title: string;
  location: string;
  category: string;
  status: DonationStatus;
  coordinator: string;
  updatedAt: string;
};
