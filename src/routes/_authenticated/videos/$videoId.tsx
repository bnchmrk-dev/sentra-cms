import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  Video,
  Save,
  Upload,
  FileVideo,
  X,
  Calendar,
  Play,
  Loader2,
  HelpCircle,
  ImageIcon,
  Building2,
  Globe2,
  Send,
  MessageSquare,
  Tag,
  Captions,
  GraduationCap,
} from 'lucide-react'
import {
  useVideo,
  useUpdateVideo,
  useReplaceVideoFile,
  useUploadThumbnail,
  useDeleteVideo,
  useSetInductionVideo,
  useCompanies,
  useTeamsConversations,
  useSendTeamsVideo,
} from '../../../hooks'
import {
  Card,
  Button,
  Input,
  Alert,
  Badge,
  ConfirmModal,
  Combobox,
  Modal,
} from '../../../components/ui'
import { PageHeader } from '../../../components/layout'
import { QuestionEditor } from '../../../components/QuestionEditor'
import { MetadataEditor } from '../../../components/MetadataEditor'
import { createVttBlobUrl } from '../../../lib/srt'

export const Route = createFileRoute('/_authenticated/videos/$videoId')({
  component: VideoDetailPage,
})

function VideoDetailPage() {
  const { videoId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useVideo(videoId)
  const { data: companiesData, isLoading: companiesLoading } = useCompanies()
  const updateVideo = useUpdateVideo()
  const replaceFile = useReplaceVideoFile()
  const uploadThumbnail = useUploadThumbnail()
  const deleteVideo = useDeleteVideo()
  const setInduction = useSetInductionVideo()

  // Teams bot hooks
  const { data: conversationsData, isLoading: conversationsLoading } =
    useTeamsConversations()
  const sendTeamsVideo = useSendTeamsVideo()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  )
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInductionModal, setShowInductionModal] = useState(false)
  const [showTeamsModal, setShowTeamsModal] = useState(false)
  const [selectedTeamsUser, setSelectedTeamsUser] = useState<string | null>(
    null,
  )
  const [teamsSendSuccess, setTeamsSendSuccess] = useState(false)
  const [srt, setSrt] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const video = data?.video

  // Build company options for the combobox
  const companyOptions = useMemo(() => {
    if (!companiesData?.companies) return []
    return companiesData.companies.map((company) => ({
      value: company.id,
      label: company.name,
    }))
  }, [companiesData])

  // Build Teams user options for the combobox
  const teamsUserOptions = useMemo(() => {
    if (!conversationsData?.conversations) return []
    return conversationsData.conversations.map((conv) => ({
      value: conv.teamsUserId,
      label: conv.userName || conv.userEmail || conv.teamsUserId,
    }))
  }, [conversationsData])

  const previewVttUrl = useMemo(() => {
    const srtText = video?.srt
    if (!srtText) return null
    return createVttBlobUrl(srtText)
  }, [video?.srt])

  useEffect(() => {
    return () => {
      if (previewVttUrl) URL.revokeObjectURL(previewVttUrl)
    }
  }, [previewVttUrl])

  // Handle sending video to Teams user
  const handleSendToTeams = async () => {
    if (!selectedTeamsUser || !video) return

    try {
      await sendTeamsVideo.mutateAsync({
        teamsUserId: selectedTeamsUser,
        videoId: video.id,
      })
      setTeamsSendSuccess(true)
      setTimeout(() => {
        setShowTeamsModal(false)
        setSelectedTeamsUser(null)
        setTeamsSendSuccess(false)
      }, 2000)
    } catch {
      // Error handled by mutation
    }
  }

  // Initialize form when data loads
  useEffect(() => {
    if (video && !isInitialized) {
      setTitle(video.title)
      // Format as local time for datetime-local input
      const dt = new Date(video.publishDate)
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const d = String(dt.getDate()).padStart(2, '0')
      const h = String(dt.getHours()).padStart(2, '0')
      const min = String(dt.getMinutes()).padStart(2, '0')
      setPublishDate(`${y}-${m}-${d}T${h}:${min}`)
      setSelectedCompanyId(video.companyId)
      setSrt(video.srt || '')
      setIsInitialized(true)
    }
  }, [video, isInitialized])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setNewFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewFile(file)
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const clearNewThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setNewThumbnailFile(null)
    setThumbnailPreview(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isPublished = (publishDate: string) => {
    return new Date(publishDate) <= new Date()
  }

  const hasChanges =
    video &&
    (title !== video.title ||
      new Date(publishDate).toISOString() !==
        new Date(video.publishDate).toISOString() ||
      selectedCompanyId !== video.companyId ||
      srt !== (video.srt || '') ||
      newFile !== null ||
      newThumbnailFile !== null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video) return

    try {
      // If there's a new file, upload it first
      if (newFile) {
        await replaceFile.mutateAsync({ id: video.id, file: newFile })
        setNewFile(null)
      }

      // Upload new thumbnail if selected
      let newThumbnailUrl: string | undefined
      if (newThumbnailFile) {
        const thumbResult = await uploadThumbnail.mutateAsync({
          file: newThumbnailFile,
        })
        newThumbnailUrl = thumbResult.url
        setNewThumbnailFile(null)
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
        setThumbnailPreview(null)
      }

      // Update metadata if changed
      const titleChanged = title !== video.title
      const dateChanged =
        new Date(publishDate).toISOString() !==
        new Date(video.publishDate).toISOString()
      const companyChanged = selectedCompanyId !== video.companyId
      const srtChanged = srt !== (video.srt || '')

      if (titleChanged || dateChanged || companyChanged || srtChanged || newThumbnailUrl) {
        await updateVideo.mutateAsync({
          id: video.id,
          data: {
            title: titleChanged ? title : undefined,
            publishDate: dateChanged
              ? new Date(publishDate).toISOString()
              : undefined,
            companyId: companyChanged ? selectedCompanyId : undefined,
            srt: srtChanged ? (srt || null) : undefined,
            thumbnailUrl: newThumbnailUrl,
          },
        })
      }
    } catch {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    if (!video) return
    try {
      await deleteVideo.mutateAsync(video.id)
      navigate({ to: '/videos' })
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading video">
        {error.message}
      </Alert>
    )
  }

  if (!video) {
    return (
      <Alert variant="error" title="Video not found">
        The requested video could not be found.
      </Alert>
    )
  }

  const isSaving = updateVideo.isPending || replaceFile.isPending || uploadThumbnail.isPending

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-6">
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>
      </div>

      <PageHeader
        title="Edit Video"
        description="Update video details and replace the file if needed."
        actions={
          <div className="flex items-center gap-2">
            {video.isInduction ? (
              <Badge variant="live" dot>
                <GraduationCap className="w-3 h-3 mr-1" />
                Induction Video
              </Badge>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<GraduationCap className="w-4 h-4" />}
                onClick={() => setShowInductionModal(true)}
                isLoading={setInduction.isPending}
              >
                Set as Induction
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => setShowTeamsModal(true)}
              disabled={teamsUserOptions.length === 0}
            >
              Send to Teams
            </Button>
            {isPublished(video.publishDate) ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="warning">Scheduled</Badge>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Preview */}
        <Card variant="default" padding="lg">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Preview
          </h3>
          <div className="aspect-video rounded-lg bg-bg-elevated overflow-hidden mb-4">
            <video
              src={video.url}
              controls
              className="w-full h-full object-contain"
              poster=""
              crossOrigin="anonymous"
            >
              {previewVttUrl && (
                <track
                  kind="captions"
                  src={previewVttUrl}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="text-sm text-text-muted">
            <p>Added {formatDate(video.createdAt)}</p>
            {video.updatedAt !== video.createdAt && (
              <p>Updated {formatDate(video.updatedAt)}</p>
            )}
          </div>
        </Card>

        {/* Edit Form */}
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
            <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center">
              <Video className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Video Details
              </h2>
              <p className="text-sm text-text-muted">
                Update metadata or replace the video file.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Title */}
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Thumbnail
              </label>
              {(thumbnailPreview || video.thumbnailUrl) ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnailPreview || video.thumbnailUrl || ''}
                    alt="Thumbnail"
                    className="h-32 rounded-lg object-cover border border-border-default"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newThumbnailFile) {
                        clearNewThumbnail()
                      } else {
                        thumbnailInputRef.current?.click()
                      }
                    }}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-bg-primary/80 border border-border-default
                      text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {newThumbnailFile ? 'Undo' : 'Replace'}
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border-default rounded-xl p-4 text-center
                    hover:border-accent hover:bg-bg-hover transition-colors cursor-pointer"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImageIcon className="w-6 h-6 text-text-muted mx-auto mb-1" />
                  <p className="text-sm text-text-secondary">
                    Click to upload a thumbnail
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    JPEG, PNG, or WebP
                  </p>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>

            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-bg-elevated border border-border-default
                  text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  transition-all
                "
                required
              />
            </div>

            {/* Organization Scope */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Video Visibility
              </label>

              {/* Quick toggle for everyone vs specific org */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyId(null)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                    border transition-all text-sm font-medium
                    ${
                      selectedCompanyId === null
                        ? 'bg-accent-subtle border-accent text-accent'
                        : 'bg-bg-elevated border-border-default text-text-secondary hover:border-accent hover:text-text-primary'
                    }
                  `}
                >
                  <Globe2 className="w-4 h-4" />
                  Everyone
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCompanyId(
                      video?.companyId || companyOptions[0]?.value || null,
                    )
                  }
                  disabled={companyOptions.length === 0}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                    border transition-all text-sm font-medium
                    ${
                      selectedCompanyId !== null
                        ? 'bg-accent-subtle border-accent text-accent'
                        : 'bg-bg-elevated border-border-default text-text-secondary hover:border-accent hover:text-text-primary'
                    }
                    ${companyOptions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Building2 className="w-4 h-4" />
                  Specific Org
                </button>
              </div>

              {/* Organization selector (only shown when "Specific Org" is selected) */}
              {selectedCompanyId !== null && (
                <Combobox
                  options={companyOptions}
                  value={selectedCompanyId}
                  onChange={(val) => setSelectedCompanyId(val)}
                  placeholder="Search organizations..."
                  searchPlaceholder="Type to search..."
                  emptyMessage="No organizations found"
                  allowClear={false}
                  disabled={companiesLoading}
                />
              )}

              <p className="text-xs text-text-muted mt-2">
                {selectedCompanyId === null
                  ? 'This video is visible to all users.'
                  : 'Only users from the selected organization can view this video.'}
              </p>
            </div>

            {/* SRT Subtitles */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Captions className="w-4 h-4 inline mr-2" />
                Subtitles (SRT)
              </label>
              <textarea
                value={srt}
                onChange={(e) => setSrt(e.target.value)}
                placeholder={`Paste SRT content here...\n\n1\n00:00:01,000 --> 00:00:04,000\nHello, welcome to this video.\n\n2\n00:00:05,000 --> 00:00:08,000\nLet's get started.`}
                rows={6}
                className="
                  w-full px-4 py-2.5 rounded-lg
                  bg-bg-elevated border border-border-default
                  text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  transition-all font-mono text-sm resize-y
                "
              />
              <p className="text-xs text-text-muted mt-1">
                Paste raw SRT subtitle text. Captions will display on the video in Teams and the CMS preview.
              </p>
            </div>

            {/* Replace File */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Replace Video File
              </label>
              <div
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center
                  transition-colors cursor-pointer
                  ${
                    dragActive
                      ? 'border-accent bg-accent-subtle'
                      : newFile
                        ? 'border-status-live bg-status-live-bg'
                        : 'border-border-default hover:border-accent hover:bg-bg-hover'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {newFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileVideo className="w-5 h-5 text-status-live" />
                    <div className="text-left">
                      <p className="font-medium text-text-primary text-sm">
                        {newFile.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatFileSize(newFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNewFile(null)
                      }}
                      className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Upload className="w-5 h-5 text-text-muted" />
                    <span className="text-sm text-text-secondary">
                      Drop a new video or click to browse
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(updateVideo.error || replaceFile.error || uploadThumbnail.error) && (
              <Alert variant="error">
                {updateVideo.error?.message || replaceFile.error?.message || uploadThumbnail.error?.message}
              </Alert>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="text-status-error hover:bg-status-error-bg"
                disabled={video.isInduction}
                title={video.isInduction ? "Cannot delete the induction video" : undefined}
              >
                Delete Video
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                disabled={!hasChanges}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Questions Section */}
      <Card variant="default" padding="lg" className="mt-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Quiz Questions
            </h2>
            <p className="text-sm text-text-muted">
              Add multiple choice questions for viewers to answer after
              watching.
            </p>
          </div>
        </div>

        <QuestionEditor videoId={videoId} />
      </Card>

      {/* Metadata Section */}
      <Card variant="default" padding="lg" className="mt-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center">
            <Tag className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Metadata
            </h2>
            <p className="text-sm text-text-muted">
              Add custom key/value pairs to store additional information about
              this video.
            </p>
          </div>
        </div>

        <MetadataEditor videoId={videoId} />
      </Card>

      {/* Set as Induction Confirmation */}
      <ConfirmModal
        isOpen={showInductionModal}
        onClose={() => setShowInductionModal(false)}
        onConfirm={async () => {
          try {
            await setInduction.mutateAsync(videoId)
            setShowInductionModal(false)
          } catch {
            // Error handled by mutation
          }
        }}
        title="Set as Induction Video"
        description={`Are you sure you want to set "${video.title}" as the induction video? This will replace the current induction video if one is set.`}
        confirmText="Set as Induction"
        isLoading={setInduction.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Video"
        description={`Are you sure you want to delete "${video.title}"? This will permanently remove the video file.`}
        confirmText="Delete Video"
        confirmVariant="danger"
        isLoading={deleteVideo.isPending}
      />

      {/* Send to Teams Modal */}
      <Modal
        isOpen={showTeamsModal}
        onClose={() => {
          setShowTeamsModal(false)
          setSelectedTeamsUser(null)
          setTeamsSendSuccess(false)
        }}
        title="Send Video to Teams"
      >
        <div className="space-y-4">
          {teamsSendSuccess ? (
            <Alert variant="success" title="Message Sent!">
              The video has been sent to the selected user.
            </Alert>
          ) : (
            <>
              <p className="text-sm text-text-secondary">
                Select a Teams user to send this video to. They will receive a
                message with a link to watch "{video.title}".
              </p>

              {conversationsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : teamsUserOptions.length === 0 ? (
                <Alert variant="warning" title="No Teams Users">
                  No users have installed the Sentra bot yet. Users need to add
                  the bot in Teams before you can send them messages.
                </Alert>
              ) : (
                <Combobox
                  options={teamsUserOptions}
                  value={selectedTeamsUser}
                  onChange={(val) => setSelectedTeamsUser(val)}
                  placeholder="Select a Teams user..."
                  searchPlaceholder="Search users..."
                  emptyMessage="No users found"
                />
              )}

              {sendTeamsVideo.error && (
                <Alert variant="error">{sendTeamsVideo.error.message}</Alert>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowTeamsModal(false)
                    setSelectedTeamsUser(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendToTeams}
                  disabled={!selectedTeamsUser}
                  isLoading={sendTeamsVideo.isPending}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Send Video
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
