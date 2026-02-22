import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Loader2, CheckCircle, Play } from 'lucide-react'
import { createVttBlobUrl } from '../../../lib/srt'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const INDUCTION_VIDEO_ID = import.meta.env.VITE_INDUCTION_VIDEO_ID || ''

export const Route = createFileRoute('/watch/$videoId/$teamsUserId')({
  component: WatchVideoPage,
})

interface VideoData {
  id: string
  title: string
  url: string
  srt?: string | null
}

function WatchVideoPage() {
  const { videoId, teamsUserId } = Route.useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [quizSent, setQuizSent] = useState(false)

  const vttUrl = useMemo(() => {
    if (!video?.srt) return null
    return createVttBlobUrl(video.srt)
  }, [video?.srt])

  useEffect(() => {
    return () => {
      if (vttUrl) URL.revokeObjectURL(vttUrl)
    }
  }, [vttUrl])

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`${API_URL}/api/videos/${videoId}/public`)
        if (!res.ok) {
          throw new Error('Video not found')
        }
        const data = await res.json()
        setVideo(data.video)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  // Track progress
  const updateProgress = useCallback(async (newProgress: number) => {
    if (completed) return

    setProgress(newProgress)

    // Only send progress updates at certain thresholds to avoid too many requests
    const thresholds = [25, 50, 75, 90, 100]
    const shouldUpdate = thresholds.some(
      (t) => newProgress >= t && progress < t
    )

    if (shouldUpdate || newProgress >= 75) {
      try {
        console.log('[Watch] Sending progress update:', { teamsUserId, videoId, progress: newProgress })
        
        const res = await fetch(`${API_URL}/api/progress/video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamsUserId,
            videoId,
            progress: newProgress,
          }),
        })

        if (!res.ok) {
          const errorText = await res.text()
          console.error('[Watch] Progress API error:', res.status, errorText)
          return
        }

        const data = await res.json()
        console.log('[Watch] Progress response:', data)

        if (data.progress?.completed) {
          setCompleted(true)
        }

        if (data.quizTriggered) {
          setQuizSent(true)
        }
        
        if (data.quizError) {
          console.error('[Watch] Quiz error from API:', data.quizError)
        }
      } catch (err) {
        console.error('[Watch] Failed to update progress:', err)
      }
    }
  }, [videoId, teamsUserId, progress, completed])

  // Handle video time update
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || video.duration === 0) return

    const newProgress = (video.currentTime / video.duration) * 100
    updateProgress(newProgress)
  }

  // Handle video play
  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
          <p className="text-gray-400">{error || 'This video is not available.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <h1 className="text-white text-lg font-semibold truncate">{video.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          {completed ? (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Completed
            </span>
          ) : (
            <span className="text-gray-400 text-sm">
              {Math.round(progress)}% watched
            </span>
          )}
          {quizSent && (
            <span className="text-blue-400 text-sm ml-2">
              Quiz sent to Teams!
            </span>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full max-h-screen object-contain"
          controls
          autoPlay={false}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          playsInline
          crossOrigin="anonymous"
        >
          {vttUrl && (
            <track
              kind="captions"
              src={vttUrl}
              srcLang="en"
              label="English"
              default
            />
          )}
        </video>
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className={`h-full transition-all duration-300 ${
            completed ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Completion overlay */}
      {completed && (videoId === INDUCTION_VIDEO_ID || quizSent) && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="text-center text-white p-8 max-w-md">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {videoId === INDUCTION_VIDEO_ID ? 'Induction Complete!' : 'Video Complete!'}
            </h2>
            <p className="text-gray-300 mb-4">
              {videoId === INDUCTION_VIDEO_ID
                ? "Welcome aboard! You'll now start receiving your scheduled training content in Teams."
                : 'Great job! Your quiz questions have been sent to Teams. Head back to Teams to answer them.'}
            </p>
            <p className="text-gray-500 text-sm">
              You can close this window now.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
