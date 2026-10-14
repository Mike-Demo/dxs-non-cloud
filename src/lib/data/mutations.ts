import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRepository } from "./client";
import type { ContentType } from "./models";
import type { UploadInput } from "./private-ops";
import type {
  ApplicationInput,
  CartLine,
  CheckoutInput,
  CommonContentInput,
  ContactInput,
  FeedbackInput,
  MediaMetaInput,
  NewsletterInput,
  TypedFields,
  ProfileInput,
  RegistrationInput,
  ReviewInput,
  SettingsInput,
  SurveyInput,
  TicketInput,
} from "./schemas";

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

const useInvalidatingMutation = <TVars, TResult>(fn: (v: TVars) => Promise<TResult>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ["dxs"] }) });
};

export const useProfileMutation = () => useInvalidatingMutation((v: ProfileInput) => getRepository().updateProfile(v));
export const useSettingsMutation = () => useInvalidatingMutation((v: SettingsInput) => getRepository().updateSettings(v));
export const useTicketMutation = () => useInvalidatingMutation((v: TicketInput) => getRepository().createTicket(v));
export const useSurveyMutation = () => useInvalidatingMutation((v: SurveyInput) => getRepository().submitSurvey(v));
export const useFeedbackMutation = () => useInvalidatingMutation((v: FeedbackInput) => getRepository().submitFeedback(v));
export const useReviewMutation = (productId: string) => useInvalidatingMutation((v: ReviewInput) => getRepository().submitReview(productId, v));
export const useMarkReadMutation = () => useInvalidatingMutation((id: string | "all") => (id === "all" ? getRepository().markAllNotificationsRead() : getRepository().markNotificationRead(id)));
export const useCreateContentMutation = () => useInvalidatingMutation((type: ContentType) => getRepository().createContent(type));
export const useSaveContentMutation = (id: string) =>
  useInvalidatingMutation((v: { common: CommonContentInput; typed?: TypedFields }) => getRepository().saveContent(id, v.common, v.typed));
export const useModerateReviewMutation = () =>
  useInvalidatingMutation((v: { id: string; moderation: "approved" | "pending" | "rejected" }) => getRepository().moderateReview(v.id, v.moderation));
export const useDeleteContentMutation = () => useInvalidatingMutation((id: string) => getRepository().deleteContent(id));
export const useUploadMediaMutation = () => useInvalidatingMutation((v: UploadInput) => getRepository().uploadMedia(v));
export const useUpdateMediaMutation = () => useInvalidatingMutation((v: { id: string; input: MediaMetaInput }) => getRepository().updateMedia(v.id, v.input));
export const useDeleteMediaMutation = () => useInvalidatingMutation((v: { id: string; force: boolean }) => getRepository().deleteMedia(v.id, v.force));
