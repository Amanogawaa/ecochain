import type { DonationRepository } from "@/domains/donations/DonationRepository";

export const getDonation = async (
  repository: DonationRepository,
  id: string,
) => {
  return repository.getById(id);
};
