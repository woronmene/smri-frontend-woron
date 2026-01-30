import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string as relative time (e.g. "2h ago", "1d ago").
 * Falls back to "Not started" for null/undefined.
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return "Not started";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now - date;
  const diffM = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  const diffW = Math.floor(diffMs / 604_800_000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  if (diffW < 4) return `${diffW}w ago`;
  return date.toLocaleDateString();
}

/**
 * True if the ISO date string is within the last N days (inclusive of today).
 * Used for "active in past 7 days"–style metrics.
 */
export function isActiveWithinPastDays(isoString, days = 7) {
  if (!isoString) return false;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return date >= cutoff;
}
