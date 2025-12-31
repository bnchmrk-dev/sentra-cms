import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { ArrowLeft, Video, Save, Upload, FileVideo, X, Calendar, Play, Loader2, HelpCircle, Building2, Globe2 } from "lucide-react";
import { useVideo, useUpdateVideo, useReplaceVideoFile, useDeleteVideo, useCompanies } from "../../../hooks";
import { Card, Button, Input, Alert, Badge, ConfirmModal, Combobox } from "../../../components/ui";
import { PageHeader } from "../../../components/layout";
import { QuestionEditor } from "../../../components/QuestionEditor";

export const Route = createFileRoute("/_authenticated/videos/$videoId")({
  component: VideoDetailPage,
});

function VideoDetailPage() {
  const { videoId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useVideo(videoId);
  const { data: companiesData, isLoading: companiesLoading } = useCompanies();
  const updateVideo = useUpdateVideo();
  const replaceFile = useReplaceVideoFile();
  const deleteVideo = useDeleteVideo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const video = data?.video;

  // Build company options for the combobox
  const companyOptions = useMemo(() => {
    if (!companiesData?.companies) return [];
    return companiesData.companies.map((company) => ({
      value: company.id,
      label: company.name,
    }));
  }, [companiesData]);

  // Initialize form when data loads
  useEffect(() => {
    if (video && !isInitialized) {
      setTitle(video.title);
      setPublishDate(new Date(video.publishDate).toISOString().slice(0, 16));
      setSelectedCompanyId(video.companyId);
      setIsInitialized(true);
    }
  }, [video, isInitialized]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setNewFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isPublished = (publishDate: string) => {
    return new Date(publishDate) <= new Date();
  };

  const hasChanges = video && (
    title !== video.title ||
    new Date(publishDate).toISOString() !== new Date(video.publishDate).toISOString() ||
    selectedCompanyId !== video.companyId ||
    newFile !== null
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;

    try {
      // If there's a new file, upload it first
      if (newFile) {
        await replaceFile.mutateAsync({ id: video.id, file: newFile });
        setNewFile(null);
      }

      // Update metadata if changed
      const titleChanged = title !== video.title;
      const dateChanged = new Date(publishDate).toISOString() !== new Date(video.publishDate).toISOString();
      const companyChanged = selectedCompanyId !== video.companyId;
      
      if (titleChanged || dateChanged || companyChanged) {
        await updateVideo.mutateAsync({
          id: video.id,
          data: {
            title: titleChanged ? title : undefined,
            publishDate: dateChanged ? new Date(publishDate).toISOString() : undefined,
            companyId: companyChanged ? selectedCompanyId : undefined,
          },
        });
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!video) return;
    try {
      await deleteVideo.mutateAsync(video.id);
      navigate({ to: "/videos" });
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading video">
        {error.message}
      </Alert>
    );
  }

  if (!video) {
    return (
      <Alert variant="error" title="Video not found">
        The requested video could not be found.
      </Alert>
    );
  }

  const isSaving = updateVideo.isPending || replaceFile.isPending;

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
        action={
          <div className="flex items-center gap-2">
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
            >
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
                    ${selectedCompanyId === null
                      ? "bg-accent-subtle border-accent text-accent"
                      : "bg-bg-elevated border-border-default text-text-secondary hover:border-accent hover:text-text-primary"
                    }
                  `}
                >
                  <Globe2 className="w-4 h-4" />
                  Everyone
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCompanyId(video?.companyId || companyOptions[0]?.value || null)}
                  disabled={companyOptions.length === 0}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                    border transition-all text-sm font-medium
                    ${selectedCompanyId !== null
                      ? "bg-accent-subtle border-accent text-accent"
                      : "bg-bg-elevated border-border-default text-text-secondary hover:border-accent hover:text-text-primary"
                    }
                    ${companyOptions.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
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
                  ? "This video is visible to all users."
                  : "Only users from the selected organization can view this video."}
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
                  ${dragActive
                    ? "border-accent bg-accent-subtle"
                    : newFile
                      ? "border-status-live bg-status-live-bg"
                      : "border-border-default hover:border-accent hover:bg-bg-hover"
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
                        e.stopPropagation();
                        setNewFile(null);
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

            {(updateVideo.error || replaceFile.error) && (
              <Alert variant="error">
                {updateVideo.error?.message || replaceFile.error?.message}
              </Alert>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="text-status-error hover:bg-status-error-bg"
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
              Add multiple choice questions for viewers to answer after watching.
            </p>
          </div>
        </div>

        <QuestionEditor videoId={videoId} />
      </Card>

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
    </div>
  );
}


