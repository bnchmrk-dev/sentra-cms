import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, Tag } from 'lucide-react'
import { useUpdateVideo, useVideo } from '../hooks'
import { Button, Input, Alert } from './ui'

interface MetadataEditorProps {
  videoId: string
}

interface MetadataRow {
  key: string
  value: string
}

function recordToRows(
  metadata: Record<string, string> | null | undefined,
): MetadataRow[] {
  if (!metadata) return []
  return Object.entries(metadata).map(([key, value]) => ({ key, value }))
}

function rowsToRecord(rows: MetadataRow[]): Record<string, string> | null {
  const valid = rows.filter((r) => r.key.trim())
  if (valid.length === 0) return null
  return Object.fromEntries(valid.map((r) => [r.key.trim(), r.value.trim()]))
}

export function MetadataEditor({ videoId }: MetadataEditorProps) {
  const { data, isLoading } = useVideo(videoId)
  const updateVideo = useUpdateVideo()
  const [rows, setRows] = useState<MetadataRow[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const video = data?.video

  useEffect(() => {
    if (video && !isInitialized) {
      setRows(recordToRows(video.metadata as Record<string, string> | null))
      setIsInitialized(true)
    }
  }, [video, isInitialized])

  const addRow = () => {
    setRows((prev) => [...prev, { key: '', value: '' }])
  }

  const updateRow = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      await updateVideo.mutateAsync({
        id: videoId,
        data: { metadata: rowsToRecord(rows) },
      })
    } catch {
      // Error handled by mutation
    }
  }

  const hasEmptyKeys = rows.some(
    (r) => !r.key.trim() && r.value.trim(),
  )
  const hasDuplicateKeys =
    new Set(rows.filter((r) => r.key.trim()).map((r) => r.key.trim())).size !==
    rows.filter((r) => r.key.trim()).length

  const originalRecord = video?.metadata as Record<string, string> | null
  const currentRecord = rowsToRecord(rows)
  const hasChanges =
    JSON.stringify(originalRecord ?? null) !==
    JSON.stringify(currentRecord ?? null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border-default rounded-lg">
          <Tag className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-4">No metadata yet</p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={addRow}
          >
            Add First Entry
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => updateRow(index, 'key', e.target.value)}
                    placeholder="Key"
                    className="
                      w-full bg-bg-input border border-border-default rounded-md px-3 py-2
                      text-text-primary placeholder:text-text-muted text-sm
                      focus:outline-none focus:ring-1 focus:border-accent focus:ring-accent/50
                    "
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="
                      w-full bg-bg-input border border-border-default rounded-md px-3 py-2
                      text-text-primary placeholder:text-text-muted text-sm
                      focus:outline-none focus:ring-1 focus:border-accent focus:ring-accent/50
                    "
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="flex-shrink-0 p-2 text-text-muted hover:text-status-error transition-colors mt-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {hasEmptyKeys && (
            <p className="text-xs text-status-warning">
              Keys cannot be empty when a value is provided
            </p>
          )}
          {hasDuplicateKeys && (
            <p className="text-xs text-status-warning">
              Duplicate keys detected — only the last value will be kept
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={addRow}
            >
              Add Entry
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              isLoading={updateVideo.isPending}
              disabled={!hasChanges || hasEmptyKeys}
            >
              Save Metadata
            </Button>
          </div>
        </>
      )}

      {updateVideo.error && (
        <Alert variant="error">{updateVideo.error.message}</Alert>
      )}
    </div>
  )
}
