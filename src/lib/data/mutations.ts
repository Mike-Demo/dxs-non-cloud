import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRepository } from "./client";
import type { ApplicationInput, CartLine, CheckoutInput, ContactInput, NewsletterInput, RegistrationInput } from "./schemas";

export const useNewsletterMutation = () =>
  useMutation({ mutationFn: (input: NewsletterInput) => getRepository().subscribeNewsletter(input) });

export const useContactMutation = () =>
  useMutation({ mutationFn: (input: ContactInput) => getRepository().submitContact(input) });

export const useRegistrationMutation = (eventId: string) =>
  useMutation({ mutationFn: (input: RegistrationInput) => getRepository().registerForEvent(eventId, input) });

export const useApplicationMutation = () =>
  useMutation({ mutationFn: ({ jobId, input }: { jobId: string; input: ApplicationInput }) => getRepository().applyToJob(jobId, input) });

export const useCheckoutMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lines, input }: { lines: CartLine[]; input: CheckoutInput }) => getRepository().checkout(lines, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dxs"] }),
  });
};
