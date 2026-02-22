/**
 * Convert SRT subtitle text to WebVTT format.
 * HTML5 <track> elements require VTT, not SRT.
 * The main differences: VTT has a "WEBVTT" header and uses "." instead of "," for ms.
 */
export function srtToVtt(srt: string): string {
  const vtt = srt
    .replace(/\r\n/g, '\n')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')

  return `WEBVTT\n\n${vtt.trim()}\n`
}

/**
 * Create a blob URL from SRT text for use in <track src>.
 * Caller is responsible for revoking the URL when done.
 */
export function createVttBlobUrl(srt: string): string {
  const vtt = srtToVtt(srt)
  const blob = new Blob([vtt], { type: 'text/vtt' })
  return URL.createObjectURL(blob)
}
