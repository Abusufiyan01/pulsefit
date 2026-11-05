/**
 * Resolves an image URL whether it is a local upload, external link, or blob/data URI.
 * Uses VITE_API_URL or relative fallback for uploaded media.
 */
export function getImageUrl(path, fallback = '') {
  if (!path) return fallback;

  // Blob or Data URLs (for instant client preview)
  if (path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }

  // Already a full external URL (http:// or https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Normalize path with leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If VITE_API_URL is configured with a full host, prepend that origin
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
    try {
      const url = new URL(apiUrl);
      return `${url.origin}${cleanPath}`;
    } catch (_e) {
      // ignore URL parse error
    }
  }

  return cleanPath;
}

export default getImageUrl;
