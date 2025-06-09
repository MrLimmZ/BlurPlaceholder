const mimeMap: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/svg+xml': 'SVG',
  'image/x-icon': 'ICO',
  'video/mp4': 'MP4',
  'application/json': 'JSON',
  'application/pdf': 'PDF',
};

export const formatMime = (mime: string): string =>
  mimeMap[mime] || mime.split('/')[1]?.toUpperCase() || mime;