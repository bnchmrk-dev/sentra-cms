import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Loader2,
  Play,
  Film,
  CheckCircle2,
  XCircle,
  Flame,
  X,
  ChevronDown,
} from 'lucide-react'
import * as microsoftTeams from '@microsoft/teams-js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const Route = createFileRoute('/library/$teamsUserId')({
  component: LibraryPage,
})

interface Answer {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  answers: Answer[]
  userAnswer: {
    selectedAnswerIds: string[]
    isCorrect: boolean
  } | null
}

interface VideoItem {
  id: string
  title: string
  url: string
  srt: string | null
  thumbnailUrl: string | null
  publishDate: string
  questions: Question[]
}

/** Convert SRT timestamps to VTT format (comma → dot) */
function srtToVtt(srt: string): string {
  return srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
}

function LibraryPage() {
  const { teamsUserId } = Route.useParams()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [watchingVideo, setWatchingVideo] = useState<{
    id: string
    title: string
    url: string
    srt: string | null
  } | null>(null)

  // Initialize Teams SDK
  useEffect(() => {
    microsoftTeams.app.initialize().catch(() => {})
  }, [])

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch(
          `${API_URL}/api/videos/library/${teamsUserId}`,
        )
        if (!res.ok) throw new Error('Failed to load videos')
        const data = await res.json()
        setVideos(data.videos)
        setStreak(data.streak ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [teamsUserId])

  const openVideo = (video: VideoItem) => {
    setWatchingVideo({
      id: video.id,
      title: video.title,
      url: video.url,
      srt: video.srt,
    })
  }

  const closeVideo = () => {
    setWatchingVideo(null)
  }

  const toggleExpand = (videoId: string) => {
    setExpandedVideo(expandedVideo === videoId ? null : videoId)
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
      {/* Video Player Modal */}
      {watchingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Video */}
            <video
              src={watchingVideo.url}
              controls
              autoPlay
              className="w-full rounded-lg"
            >
              {watchingVideo.srt && (
                <track
                  kind="subtitles"
                  src={`data:text/vtt;charset=utf-8,${encodeURIComponent(
                    'WEBVTT\n\n' + srtToVtt(watchingVideo.srt),
                  )}`}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
            </video>
            {/* Title below video */}
            <p className="text-sm text-gray-400 mt-3 truncate">
              {watchingVideo.title}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1f1f1f] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="w-6 h-6 text-indigo-400" />
            <div>
              <h1 className="text-xl font-semibold">Briefing Library</h1>
              <p className="text-gray-400 text-sm">
                {videos.length} briefing{videos.length !== 1 ? 's' : ''}{' '}
                available
              </p>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-[#2d2d2d] rounded-lg px-4 py-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <div className="text-right">
                <p className="text-lg font-bold leading-tight">{streak}</p>
                <p className="text-xs text-gray-400 leading-tight">streak</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video List */}
      {videos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">No briefings available yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {videos.map((video) => {
            const isExpanded = expandedVideo === video.id
            const hasQuestions = video.questions.length > 0
            const answeredQuestions = video.questions.filter(
              (q) => q.userAnswer,
            )
            const correctAnswers = answeredQuestions.filter(
              (q) => q.userAnswer?.isCorrect,
            )

            return (
              <div
                key={video.id}
                className="bg-[#2d2d2d] rounded-xl overflow-hidden"
              >
                {/* Video Row — clickable to expand */}
                <div
                  className="flex items-center gap-4 p-3 cursor-pointer hover:bg-[#343434] transition-colors"
                  onClick={() => toggleExpand(video.id)}
                >
                  {/* Thumbnail */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openVideo(video)
                    }}
                    className="group relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-[#1a1a1a]"
                    title="Watch briefing"
                  >
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-7 h-7 text-gray-600" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-4 h-4 text-gray-900 ml-0.5" />
                      </div>
                    </div>
                  </button>

                  {/* Title & date */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[15px] text-gray-100 truncate">
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

                  {/* Quiz score badge */}
                  {hasQuestions && answeredQuestions.length > 0 && (
                    <span
                      className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        correctAnswers.length === video.questions.length
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-yellow-900/40 text-yellow-400'
                      }`}
                    >
                      {correctAnswers.length}/{video.questions.length}
                    </span>
                  )}

                  {/* Expand indicator */}
                  {hasQuestions && (
                    <ChevronDown
                      className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>

                {/* Expanded Questions */}
                {isExpanded && hasQuestions && (
                  <div className="border-t border-gray-700/50 px-5 py-4 space-y-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quiz Results
                    </p>
                    {video.questions.map((question, qIndex) => (
                      <div key={question.id} className="space-y-3">
                        <p className="text-sm text-gray-200 font-medium">
                          <span className="text-indigo-400 mr-1.5">
                            {qIndex + 1}.
                          </span>
                          {question.text}
                        </p>
                        <div className="space-y-1.5 ml-5">
                          {question.answers.map((answer) => {
                            const wasSelected =
                              question.userAnswer?.selectedAnswerIds.includes(
                                answer.id,
                              ) ?? false
                            const isCorrectAnswer = answer.isCorrect
                            const hasAnswered = question.userAnswer !== null

                            // Determine styling
                            let containerStyle = 'border border-gray-700/50 text-gray-500'
                            let icon: React.ReactNode = null
                            let label: React.ReactNode = null

                            if (hasAnswered) {
                              if (wasSelected && isCorrectAnswer) {
                                containerStyle =
                                  'border border-green-700/60 bg-green-900/20 text-green-300'
                                icon = (
                                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )
                                label = (
                                  <span className="ml-auto text-[10px] uppercase font-semibold tracking-wider text-green-500">
                                    Correct
                                  </span>
                                )
                              } else if (wasSelected && !isCorrectAnswer) {
                                containerStyle =
                                  'border border-red-700/60 bg-red-900/20 text-red-300'
                                icon = (
                                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                )
                                label = (
                                  <span className="ml-auto text-[10px] uppercase font-semibold tracking-wider text-red-500">
                                    Your answer
                                  </span>
                                )
                              } else if (isCorrectAnswer) {
                                containerStyle =
                                  'border border-green-700/40 bg-green-900/10 text-green-400/80'
                                icon = (
                                  <CheckCircle2 className="w-4 h-4 text-green-500/60 flex-shrink-0" />
                                )
                                label = (
                                  <span className="ml-auto text-[10px] uppercase font-semibold tracking-wider text-green-600">
                                    Correct answer
                                  </span>
                                )
                              }
                            }

                            return (
                              <div
                                key={answer.id}
                                className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg ${containerStyle}`}
                              >
                                {icon || (
                                  <span className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />
                                )}
                                <span>{answer.text}</span>
                                {label}
                              </div>
                            )
                          })}
                          {!question.userAnswer && (
                            <p className="text-sm text-gray-600 italic py-1">
                              Not answered yet
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
