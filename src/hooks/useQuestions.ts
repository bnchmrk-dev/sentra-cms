import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../lib/api";
import {
  questionsResponseSchema,
  questionResponseSchema,
  messageResponseSchema,
  type QuestionsResponse,
  type QuestionResponse,
  type CreateQuestionInput,
  type UpdateQuestionInput,
} from "../schemas";

const QUESTIONS_KEY = ["questions"];

export function useVideoQuestions(videoId: string | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: [...QUESTIONS_KEY, "video", videoId],
    queryFn: () =>
      api.get<QuestionsResponse>(
        `/api/videos/${videoId}/questions`,
        undefined,
        questionsResponseSchema
      ),
    enabled: !!videoId,
  });
}

export function useQuestion(id: string | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: [...QUESTIONS_KEY, id],
    queryFn: () =>
      api.get<QuestionResponse>(`/api/questions/${id}`, undefined, questionResponseSchema),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: CreateQuestionInput }) =>
      api.post<QuestionResponse>(
        `/api/videos/${videoId}/questions`,
        data,
        undefined,
        questionResponseSchema
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUESTIONS_KEY, "video", variables.videoId] });
    },
  });
}

export function useUpdateQuestion() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      videoId,
      data,
    }: {
      id: string;
      videoId: string;
      data: UpdateQuestionInput;
    }) => api.put<QuestionResponse>(`/api/questions/${id}`, data, undefined, questionResponseSchema),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUESTIONS_KEY, "video", variables.videoId] });
      queryClient.invalidateQueries({ queryKey: [...QUESTIONS_KEY, variables.id] });
    },
  });
}

export function useDeleteQuestion() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, videoId }: { id: string; videoId: string }) =>
      api.delete(`/api/questions/${id}`, undefined, messageResponseSchema),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUESTIONS_KEY, "video", variables.videoId] });
    },
  });
}

export function useReorderQuestions() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoId,
      questions,
    }: {
      videoId: string;
      questions: Array<{ id: string; order: number }>;
    }) =>
      api.put<QuestionsResponse>(
        `/api/videos/${videoId}/questions/order`,
        { questions },
        undefined,
        questionsResponseSchema
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUESTIONS_KEY, "video", variables.videoId] });
    },
  });
}


