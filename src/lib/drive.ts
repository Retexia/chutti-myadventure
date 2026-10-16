/**
 * Turns a Google Drive share link (or bare file ID) into a small, resized
 * image URL served by Google — nothing is downloaded into the repo.
 * Any non-Drive URL (e.g. Supabase Storage) is returned unchanged.
 * Files must be shared as "Anyone with the link → Viewer".
 */
const DRIVE_ID_PATTERNS = [
  /\/file\/d\/([\w-]{20,})/, // https://drive.google.com/file/d/<id>/view
  /[?&]id=([\w-]{20,})/, // https://drive.google.com/open?id=<id>, uc?id=<id>
  /googleusercontent\.com\/d\/([\w-]{20,})/ // https://lh3.googleusercontent.com/d/<id>
];

export function driveFileId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{20,}$/.test(value)) return value;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function driveImage(input: string, width = 1000): string {
  const id = driveFileId(input);
  if (!id) return input.trim();
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}
