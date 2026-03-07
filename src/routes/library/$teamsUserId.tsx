import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Loader2, Play, Film } from 'lucide-react'
import * as microsoftTeams from '@microsoft/teams-js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000'

export const Route = createFileRoute('/library/$teamsUserId')({
  component: LibraryPage,
})

interface VideoItem {
  id: string
  title: string
  thumbnailUrl: string | null
  publishDate: string
}

function LibraryPage() {
  const { teamsUserId } = Route.useParams()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamsReady, setTeamsReady] = useState(false)

  // Initialize Teams SDK
  useEffect(() => {
    microsoftTeams.app
      .initialize()
      .then(() => setTeamsReady(true))
      .catch(() => {
        // Still allow page to work outside Teams for development
        setTeamsReady(false)
      })
  }, [])

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch(
          `${API_URL}/api/videos/library/${teamsUserId}`
        )
        if (!res.ok) throw new Error('Failed to load videos')
        const data = await res.json()
        setVideos(data.videos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [teamsUserId])

  const openVideo = (videoId: string) => {
    const watchUrl = `${CMS_URL}/watch/${videoId}/${teamsUserId}`

    if (teamsReady) {
      microsoftTeams.dialog.url.open({
        url: watchUrl,
        title: 'Watch Briefing',
        size: { height: 700, width: 1000 },
      })
    } else {
      // Fallback for development outside Teams
      window.open(watchUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1f1f1f] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Film className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-semibold">Briefing Library</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          {videos.length} briefing{videos.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Video List */}
      {videos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">No briefings available yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => openVideo(video.id)}
              className="group bg-[#2d2d2d] hover:bg-[#383838] rounded-lg overflow-hidden text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#1a1a1a]">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-100 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(video.publishDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
