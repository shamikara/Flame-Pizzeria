/**
 * Cleans and normalizes image paths for Next.js Image component
 * - Removes query parameters (e.g., ?height=300&width=300)
 * - Ensures path starts with / for absolute path from root
 * - Provides fallback to placeholder
 */
export function getImagePath(path: string | null | undefined): string {
    if (!path) return "/img/placeholder.jpg";
    
    // Remove query parameters
    const cleanPath = path.split('?')[0];
    
    // Add leading slash if missing
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }