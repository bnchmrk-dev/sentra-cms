import { useQuery, useMutation } from "@tanstack/react-query";
import { useApi } from "../lib/api";
import { z } from "zod";

// Schemas
const teamsConversationSchema = z.object({
  id: z.string(),
  teamsUserId: z.string(),
  conversationId: z.string(),
  serviceUrl: z.string(),
  tenantId: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const conversationsResponseSchema = z.object({
  conversations: z.array(teamsConversationSchema),
});

const sendMessageResponseSchema = z.object({
  success: z.boolean(),
  teamsUserId: z.string().optional(),
  error: z.string().optional(),
});

export type TeamsConversation = z.infer<typeof teamsConversationSchema>;
export type ConversationsResponse = z.infer<typeof conversationsResponseSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

const BOT_KEY = ["bot"];

/**
 * Get all Teams users who have installed the bot
 */
export function useTeamsConversations() {
  const api = useApi();

  return useQuery({
    queryKey: [...BOT_KEY, "conversations"],
    queryFn: () =>
      api.get<ConversationsResponse>(
        "/api/bot/conversations",
        undefined,
        conversationsResponseSchema
      ),
  });
}

interface SendMessageParams {
  teamsUserId: string;
  message: string;
}

/**
 * Send a proactive message to a Teams user
 */
export function useSendTeamsMessage() {
  const api = useApi();

  return useMutation({
    mutationFn: ({ teamsUserId, message }: SendMessageParams) =>
      api.post<SendMessageResponse>(
        "/api/bot/send",
        { teamsUserId, message },
        undefined,
        sendMessageResponseSchema
      ),
  });
}
