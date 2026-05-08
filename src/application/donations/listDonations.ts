import type { DonationRepository } from "@/domains/donations/DonationRepository";

export const listDonations = async (repository: DonationRepository) => {
  return repository.list();
};
