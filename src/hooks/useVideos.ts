import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { put } from '@vercel/blob/client'
import { useApi } from '../lib/api'
import {
  videosResponseSchema,
  videoResponseSchema,
  messageResponseSchema,
  type VideosResponse,
  type VideoResponse,
  type UpdateVideoInput,
} from '../schemas'

const VIDEOS_KEY = ['videos']

export function useVideos() {
  const api = useApi()

  return useQuery({
    queryKey: VIDEOS_KEY,
    queryFn: () =>
      api.get<VideosResponse>('/api/videos', undefined, videosResponseSchema),
  })
}

export function useVideo(id: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: [...VIDEOS_KEY, id],
    queryFn: () =>
      api.get<VideoResponse>(
        `/api/videos/${id}`,
        undefined,
        videoResponseSchema,
      ),
    enabled: !!id,
  })
}

interface UploadVideoParams {
  file: File
  title: string
  publishDate: string
  companyId?: string | null // null = visible to everyone
  thumbnailUrl?: string | null
  onProgress?: (progress: {
    loaded: number
    total: number
    percentage: number
  }) => void
}

/**
 * Upload a video using client-side direct-to-blob upload.
 * This bypasses the Vercel serverless body size limit (~4.5MB)
 * by uploading directly from the browser to Vercel Blob storage.
 *
 * Flow:
 * 1. Get a scoped upload token from the API
 * 2. Upload directly to Vercel Blob (browser → blob, no size limit)
 * 3. Create the video record in the database via the API
 */
export function useUploadVideo() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      title,
      publishDate,
      companyId,
      thumbnailUrl,
      onProgress,
    }: UploadVideoParams) => {
      // Step 1: Get a scoped client token from the API
      const { clientToken } = await api.post<{ clientToken: string }>(
        '/api/videos/generate-upload-token',
        { filename: file.name },
      )

      // Step 2: Upload directly to Vercel Blob (bypasses API body limit)
      const blob = await put(file.name, file, {
        access: 'public',
        token: clientToken,
        multipart: true,
        onUploadProgress: onProgress,
      })

      // Step 3: Create the video record via the API
      return api.post<VideoResponse>(
        '/api/videos',
        {
          title,
          url: blob.url,
          thumbnailUrl: thumbnailUrl || null,
          publishDate,
          companyId: companyId || null,
        },
        undefined,
        videoResponseSchema,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY })
    },
  })
}

export function useUpdateVideo() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVideoInput }) =>
      api.put<VideoResponse>(
        `/api/videos/${id}`,
        data,
        undefined,
        videoResponseSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY })
    },
  })
}

interface ReplaceVideoFileParams {
  id: string
  file: File
  onProgress?: (progress: {
    loaded: number
    total: number
    percentage: number
  }) => void
}

/**
 * Replace a video file using client-side direct-to-blob upload.
 * Uploads the new file directly to Vercel Blob, then updates the
 * video record (API handles deleting the old blob).
 */
export function useReplaceVideoFile() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, file, onProgress }: ReplaceVideoFileParams) => {
      // Step 1: Get a scoped client token from the API
      const { clientToken } = await api.post<{ clientToken: string }>(
        '/api/videos/generate-upload-token',
        { filename: file.name },
      )

      // Step 2: Upload directly to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
        token: clientToken,
        multipart: true,
        onUploadProgress: onProgress,
      })

      // Step 3: Update the video record with the new URL (API deletes old blob)
      return api.put<VideoResponse>(
        `/api/videos/${id}`,
        { url: blob.url },
        undefined,
        videoResponseSchema,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY })
    },
  })
}

/**
 * Upload a thumbnail image using client-side direct-to-blob upload.
 * Returns the blob URL for use when creating/updating a video.
 */
export function useUploadThumbnail() {
  const api = useApi()

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: {
        loaded: number
        total: number
        percentage: number
      }) => void
    }) => {
      // Step 1: Get a scoped client token for thumbnail uploads
      const { clientToken } = await api.post<{ clientToken: string }>(
        '/api/videos/generate-thumbnail-upload-token',
        { filename: file.name },
      )

      // Step 2: Upload directly to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
        token: clientToken,
        onUploadProgress: onProgress,
      })

      return { url: blob.url }
    },
  })
}

export function useDeleteVideo() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/videos/${id}`, undefined, messageResponseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_KEY })
    },
  })
}
