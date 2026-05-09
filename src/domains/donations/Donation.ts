export type DonationStatus = "ready" | "assigned" | "transport" | "scheduled";

export type DonationPerson = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type DonationRequestContext = {
  id: string;
  title: string;
  requester: DonationPerson | null;
};

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
  request?: DonationRequestContext | null;
};
