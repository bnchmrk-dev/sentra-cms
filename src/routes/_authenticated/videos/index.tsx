import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Video,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  Calendar,
  Play,
  Globe2,
  Building2,
} from 'lucide-react'
import { useVideos, useDeleteVideo } from '../../../hooks'
import {
  Card,
  Button,
  Badge,
  ConfirmModal,
  Alert,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '../../../components/ui'
import { PageHeader } from '../../../components/layout'
import type { VideoWithCompany } from '../../../schemas'

export const Route = createFileRoute('/_authenticated/videos/')({
  component: VideosPage,
})

function VideosPage() {
  const { data, isLoading, error } = useVideos()
  const [deleteTarget, setDeleteTarget] = useState<VideoWithCompany | null>(
    null,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading videos">
        {error.message}
      </Alert>
    )
  }

  const videos = data?.videos || []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isPublished = (publishDate: string) => {
    return new Date(publishDate) <= new Date()
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Videos"
        description="Manage video content and uploads."
        actions={
          <Link to="/videos/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Upload Video
            </Button>
          </Link>
        }
      />

      {videos.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-12">
          <Video className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No videos yet
          </h3>
          <p className="text-text-muted mb-4">
            Upload your first video to get started.
          </p>
          <Link to="/videos/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Upload Video
            </Button>
          </Link>
        </Card>
      ) : (
        <Card variant="default" padding="none">
          <Table>
            <TableHeader>
              <TableHead>Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <Link
                      to="/videos/$videoId"
                      params={{ videoId: video.id }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-16 h-10 rounded-lg bg-bg-elevated flex items-center justify-center overflow-hidden relative group-hover:ring-2 ring-accent transition-all">
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                          {video.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          Added {formatDate(video.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {video.company ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        <span className="text-text-secondary text-sm">
                          {video.company.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-accent" />
                        <span className="text-accent text-sm font-medium">
                          Everyone
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      {formatDate(video.publishDate)}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    {isPublished(video.publishDate) ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Scheduled</Badge>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/videos/$videoId"
                        params={{ videoId: video.id }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                      </Link>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => setDeleteTarget(video)}
                        className="text-status-error hover:bg-status-error-bg"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation */}
      <DeleteVideoModal
        video={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// Delete Video Modal
interface DeleteVideoModalProps {
  video: VideoWithCompany | null
  onClose: () => void
}

function DeleteVideoModal({ video, onClose }: DeleteVideoModalProps) {
  const deleteVideo = useDeleteVideo()

  if (!video) return null

  const handleDelete = async () => {
    try {
      await deleteVideo.mutateAsync(video.id)
      onClose()
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <ConfirmModal
      isOpen={!!video}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Video"
      description={`Are you sure you want to delete "${video.title}"? This will permanently remove the video file.`}
      confirmText="Delete Video"
      confirmVariant="danger"
      isLoading={deleteVideo.isPending}
    />
  )
}
