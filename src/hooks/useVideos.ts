import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../lib/api";
import {
  videosResponseSchema,
  videoResponseSchema,
  messageResponseSchema,
  type VideosResponse,
  type VideoResponse,
  type UpdateVideoInput,
} from "../schemas";

const VIDEOS_KEY = ["videos"];

export function useVideos() {
  const api = useApi();

  return useQuery({
    queryKey: VIDEOS_KEY,
    queryFn: () => api.get<VideosResponse>("/api/videos", undefined, videosResponseSchema),
  });
}

export function useVideo(id: string | undefined) {
  const api = useApi();

  return useQuery({
    queryKey: [...VIDEOS_KEY, id],
    queryFn: () => api.get<VideoResponse>(`/api/videos/${id}`, undefined, videoResponseSchema),
    enabled: !!id,
  });
}

interface UploadVideoParams {
  file: File;
  title: string;
  publishDate: string;
  companyId?: string | null; // null = visible to everyone
}

export function useUploadVideo() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, publishDate, companyId }: UploadVideoParams) => {
      const params = new URLSearchParams({
        filename: file.name,
        title,
        publishDate,
      });
      // Only add companyId if it's set (not null/undefined)
      if (companyId) {
        params.set("companyId", companyId);
      }
      return api.uploadFile<VideoResponse>(
        `/api/videos/upload?${params.toString()}`,
        file,
        videoResponseSchema
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY });
    },
  });
}

export function useUpdateVideo() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVideoInput }) =>
      api.put<VideoResponse>(`/api/videos/${id}`, data, undefined, videoResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY });
    },
  });
}

interface ReplaceVideoFileParams {
  id: string;
  file: File;
}

export function useReplaceVideoFile() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: ReplaceVideoFileParams) => {
      const params = new URLSearchParams({
        filename: file.name,
      });
      return api.putFile<VideoResponse>(
        `/api/videos/${id}/replace?${params.toString()}`,
        file,
        videoResponseSchema
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY });
    },
  });
}

export function useDeleteVideo() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/videos/${id}`, undefined, messageResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY });
    },
  });
}


