import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Loader2,
  Play,
  Film,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Flame,
  X,
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
  thumbnailUrl: string | null
  publishDate: string
  questions: Question[]
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
  } | null>(null)

  // Initialize Teams SDK (still needed for theme/context, just not for dialogs)
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

  const openVideo = (videoId: string, title: string) => {
    setWatchingVideo({ id: videoId, title })
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 bg-[#1a1a1a] rounded-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-gray-700">
              <h2 className="text-sm font-medium text-gray-200 truncate">
                {watchingVideo.title}
              </h2>
              <button
                onClick={closeVideo}
                className="p-1.5 rounded hover:bg-[#383838] text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Iframe */}
            <iframe
              src={`/watch/${watchingVideo.id}/${teamsUserId}`}
              className="flex-1 w-full border-0"
              allow="autoplay; fullscreen"
            />
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
        <div className="flex flex-col gap-2 p-4">
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
                className="bg-[#2d2d2d] rounded-lg overflow-hidden"
              >
                {/* Video Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Play button */}
                  <button
                    onClick={() => openVideo(video.id, video.title)}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors"
                    title="Watch briefing"
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </button>

                  {/* Title & date */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-100 truncate">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
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
                      className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                        correctAnswers.length === video.questions.length
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-yellow-900/40 text-yellow-400'
                      }`}
                    >
                      {correctAnswers.length}/{video.questions.length}
                    </span>
                  )}

                  {/* Expand toggle */}
                  {hasQuestions && (
                    <button
                      onClick={() => toggleExpand(video.id)}
                      className="flex-shrink-0 p-1.5 rounded hover:bg-[#383838] text-gray-400 hover:text-gray-200 transition-colors"
                      title={isExpanded ? 'Hide questions' : 'Show questions'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Questions */}
                {isExpanded && hasQuestions && (
                  <div className="border-t border-gray-700 px-4 py-3 space-y-4">
                    {video.questions.map((question, qIndex) => (
                      <div key={question.id} className="space-y-2">
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-500 font-medium">
                            Q{qIndex + 1}.
                          </span>{' '}
                          {question.text}
                        </p>
                        <div className="space-y-1 ml-6">
                          {question.answers.map((answer) => {
                            const wasSelected =
                              question.userAnswer?.selectedAnswerIds.includes(
                                answer.id,
                              ) ?? false
                            const isCorrectAnswer = answer.isCorrect
                            const hasAnswered = question.userAnswer !== null

                            let answerStyle =
                              'text-gray-500 bg-transparent'
                            if (hasAnswered) {
                              if (wasSelected && isCorrectAnswer) {
                                answerStyle =
                                  'text-green-400 bg-green-900/20'
                              } else if (wasSelected && !isCorrectAnswer) {
                                answerStyle =
                                  'text-red-400 bg-red-900/20'
                              } else if (isCorrectAnswer) {
                                answerStyle =
                                  'text-green-400/60 bg-transparent'
                              }
                            }

                            return (
                              <div
                                key={answer.id}
                                className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${answerStyle}`}
                              >
                                {hasAnswered && wasSelected && isCorrectAnswer && (
                                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                {hasAnswered && wasSelected && !isCorrectAnswer && (
                                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                {hasAnswered && !wasSelected && isCorrectAnswer && (
                                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                                )}
                                {(!hasAnswered ||
                                  (!wasSelected && !isCorrectAnswer)) && (
                                  <span className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                <span>{answer.text}</span>
                              </div>
                            )
                          })}
                          {!question.userAnswer && (
                            <p className="text-xs text-gray-600 italic ml-6">
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
