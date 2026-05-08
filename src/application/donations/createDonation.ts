import type { DonationInput } from "@/domains/donations/Donation";
import type { DonationRepository } from "@/domains/donations/DonationRepository";

export const createDonation = async (
  repository: DonationRepository,
  input: DonationInput,
) => {
  return repository.create(input);
};
