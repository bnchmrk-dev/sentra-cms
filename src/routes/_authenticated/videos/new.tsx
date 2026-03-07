import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useRef, useCallback, useMemo } from 'react'
import {
  ArrowLeft,
  Video,
  Upload,
  X,
  FileVideo,
  ImageIcon,
  Building2,
  Globe2,
} from 'lucide-react'
import { useUploadVideo, useUploadThumbnail, useCompanies } from '../../../hooks'
import { Card, Button, Input, Alert, Combobox } from '../../../components/ui'
import { PageHeader } from '../../../components/layout'

export const Route = createFileRoute('/_authenticated/videos/new')({
  component: NewVideoPage,
})

function NewVideoPage() {
  const navigate = useNavigate()
  const uploadVideo = useUploadVideo()
  const uploadThumbnail = useUploadThumbnail()
  const { data: companiesData, isLoading: companiesLoading } = useCompanies()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [publishDate, setPublishDate] = useState(() => {
    // Format as local time for datetime-local input (YYYY-MM-DDTHH:mm)
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const h = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  )

  // Build company options for the combobox
  const companyOptions = useMemo(() => {
    if (!companiesData?.companies) return []
    return companiesData.companies.map((company) => ({
      value: company.id,
      label: company.name,
    }))
  }, [companiesData])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('video/')) {
        setSelectedFile(file)
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '')) // Use filename without extension as default title
        }
      }
    },
    [title],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const clearThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !title.trim()) return

    try {
      // Upload thumbnail first if selected
      let thumbnailUrl: string | null = null
      if (thumbnailFile) {
        setUploadProgress('Uploading thumbnail...')
        const thumbResult = await uploadThumbnail.mutateAsync({
          file: thumbnailFile,
        })
        thumbnailUrl = thumbResult.url
      }

      setUploadProgress('Preparing upload...')
      const result = await uploadVideo.mutateAsync({
        file: selectedFile,
        title: title.trim(),
        publishDate: new Date(publishDate).toISOString(),
        companyId: selectedCompanyId,
        thumbnailUrl,
        onProgress: ({ percentage }) => {
          if (percentage < 100) {
            setUploadProgress(`Uploading video... ${Math.round(percentage)}%`)
          } else {
            setUploadProgress('Saving video record...')
          }
        },
      })
      navigate({ to: '/videos/$videoId', params: { videoId: result.video.id } })
    } catch {
      setUploadProgress(null)
      // Error handled by mutation
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
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
        title="Upload Video"
        description="Upload a new video to the content library."
      />

      <Card variant="default" padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
          <div className="w-16 h-16 rounded-xl bg-accent-subtle flex items-center justify-center">
            <Video className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Video Details
            </h2>
            <p className="text-sm text-text-muted">
              Upload your video file and set the metadata.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Video File
            </label>
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center
                transition-colors cursor-pointer
                ${
                  dragActive
                    ? 'border-accent bg-accent-subtle'
                    : selectedFile
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

              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-status-live/20 flex items-center justify-center">
                    <FileVideo className="w-6 h-6 text-status-live" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-text-muted">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                    className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-primary font-medium mb-1">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-sm text-text-muted">
                    Supports all major video formats. No size limit.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Thumbnail Image
            </label>
            {thumbnailPreview ? (
              <div className="relative inline-block">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="h-32 rounded-lg object-cover border border-border-default"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearThumbnail()
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-bg-primary border border-border-default hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border-default rounded-xl p-6 text-center
                  hover:border-accent hover:bg-bg-hover transition-colors cursor-pointer"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <ImageIcon className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  Click to upload a thumbnail image
                </p>
                <p className="text-xs text-text-muted mt-1">
                  JPEG, PNG, or WebP. Max 10MB.
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

          {/* Title */}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
          />

          {/* Publish Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
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
            <p className="text-xs text-text-muted mt-1">
              Set a future date to schedule the video for later.
            </p>
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
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
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
                  setSelectedCompanyId(companyOptions[0]?.value || null)
                }
                disabled={companyOptions.length === 0}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
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
                ? 'This video will be visible to all users.'
                : 'Only users from the selected organization can view this video.'}
            </p>
          </div>

          {uploadVideo.error && (
            <Alert variant="error">{uploadVideo.error.message}</Alert>
          )}

          {uploadProgress && <Alert variant="info">{uploadProgress}</Alert>}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Link to="/videos">
              <Button variant="ghost" disabled={uploadVideo.isPending}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={uploadVideo.isPending}
              disabled={!selectedFile || !title.trim()}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Video
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
