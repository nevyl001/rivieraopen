/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param format - Format type: 'long', 'short', or 'medium'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: "long" | "short" | "medium" = "medium"
): string {
  const date = new Date(dateString);

  switch (format) {
    case "long":
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "short":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "medium":
    default:
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
  }
}

/**
 * Format a number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format points with suffix
 * @param points - Points value
 * @returns Formatted points string (e.g., "1,250 pts")
 */
export function formatPoints(points: number): string {
  return `${formatNumber(points)} pts`;
}

/**
 * Get relative time string (e.g., "2 days ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}
