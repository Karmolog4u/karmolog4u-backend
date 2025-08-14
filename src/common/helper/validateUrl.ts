export function isValidUrl(url: string): boolean {
  try {
    new URL(url); // Try to create a URL object
    return true; // Valid URL
  } catch {
    return false; // Invalid URL
  }
}
