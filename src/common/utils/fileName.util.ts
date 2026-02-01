export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const sanitizedOriginalName = originalName.replace(/\s+/g, '_');
  return `${timestamp}_${sanitizedOriginalName}`;
}
