/**
 * Convert title to URL-safe slug
 * Example: "Aku bingung mau ambil" -> "aku-bingung-mau-ambil"
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Extract slug from URL
 */
export const extractSlug = (pathname: string): string => {
  const cleanPath = pathname.replace(/\/$/, ''); // Remove trailing slash
  const parts = cleanPath.split('/');
  return parts[parts.length - 1] || '';
};
