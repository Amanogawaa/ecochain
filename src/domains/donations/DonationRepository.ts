import type { Donation, DonationInput } from "./Donation";

export interface DonationRepository {
  list: () => Promise<Donation[]>;
  getById: (id: string) => Promise<Donation | null>;
  create: (input: DonationInput) => Promise<Donation>;
}
