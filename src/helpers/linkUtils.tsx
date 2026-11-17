import React from "react";
import { ExternalLink } from "lucide-react";

/**
 * Normalizes any URL string into a fully qualified external URL.
 * Automatically adds https:// if missing, and handles DOI strings.
 */
export function formatUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  // Strip trailing punctuation often caught in natural language text
  url = url.replace(/[),.;:!?\]\}]+$/, "");

  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (/^doi:/i.test(url)) {
    return `https://doi.org/${url.replace(/^doi:/i, "").trim()}`;
  }
  if (/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/i.test(url)) {
    return `https://doi.org/${url}`;
  }
  if (/^doi\.org\//i.test(url)) {
    return `https://${url}`;
  }
  return `https://${url}`;
}

/**
 * Checks if a string looks like a URL or web domain.
 */
export function isUrl(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return /^(https?:\/\/|www\.|doi\.org\/|10\.\d{4,9}\/)/i.test(trimmed);
}

export interface ParsedResearch {
  title: string;
  link: string | null;
  type: string | null;
}

/**
 * Extracts clean title, link, and publication type from research items.
 * Handles pipe formatting (e.g. "Title | URL"), embedded URLs, and direct links.
 */
export function parseResearchItem(r: {
  title: string | null;
  link?: string | null;
  type?: string | null;
}): ParsedResearch {
  let displayTitle = (r.title || "").trim();
  let linkUrl = (r.link || "").trim();

  // If link is empty, check if title contains a pipe or URL
  if (!linkUrl && displayTitle) {
    if (displayTitle.includes("|")) {
      const parts = displayTitle.split("|").map((p) => p.trim());
      displayTitle = parts[0];
      linkUrl = parts[1] || "";
    } else {
      const match = displayTitle.match(
        /(https?:\/\/[^\s]+|www\.[^\s]+|doi\.org\/[^\s]+|10\.\d{4,9}\/[^\s]+)/i
      );
      if (match) {
        linkUrl = match[0].replace(/[),.;:!?\]\}]+$/, "");
        displayTitle = displayTitle
          .replace(match[0], "")
          .trim()
          .replace(/^[-–—:()\[\]{}]+|[-–—:()\[\]{}]+$/g, "")
          .trim();
        if (!displayTitle) {
          displayTitle = linkUrl;
        }
      }
    }
  } else if (displayTitle.includes("|")) {
    displayTitle = displayTitle.split("|")[0].trim();
  }

  if (!displayTitle && linkUrl) {
    displayTitle = linkUrl;
  }

  return {
    title: displayTitle || "Research Reference",
    link: linkUrl ? formatUrl(linkUrl) : null,
    type: r.type || null,
  };
}

/**
 * Parses free text (such as botanical descriptions, usage methods, or citations)
 * and turns any web URLs or links into clickable, external <a> elements.
 */
export function renderClickableText(
  text: string | null | undefined,
  linkClassName?: string
): React.ReactNode {
  if (!text) return null;

  // Regex matching http/https URLs, www. addresses, and doi links
  const urlRegex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|doi\.org\/[^\s]+|10\.\d{4,9}\/[^\s]+)/gi;

  const parts = text.split(urlRegex);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Clean trailing punctuation
      const cleanUrl = part.replace(/[),.;:!?\]\}]+$/, "");
      const trailing = part.slice(cleanUrl.length);
      const href = formatUrl(cleanUrl);

      return (
        <React.Fragment key={index}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={
              linkClassName ||
              "text-[var(--vdp-accent,var(--accent,#1F5A3D))] underline hover:opacity-80 inline-flex items-center gap-0.5 font-medium break-all"
            }
          >
            {cleanUrl}
            <ExternalLink className="w-3 h-3 inline-block shrink-0 ml-0.5" />
          </a>
          {trailing}
        </React.Fragment>
      );
    }
    return part;
  });
}
