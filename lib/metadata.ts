/**
 * Page metadata helpers.
 *
 * Canonical URLs, Open Graph and Twitter cards all derive from the configured
 * site URL, so a wrong NEXT_PUBLIC_SITE_URL cannot silently produce previews
 * pointing at somebody else's domain.
 */

import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/movies". */
  path: string;
  /** Root-relative image path under /public. */
  imagePath?: string;
  /** Set true for pages that should stay out of search results. */
  noIndex?: boolean;
};

export function absoluteUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function buildMetadata({
  title,
  description,
  path,
  imagePath,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const image = imagePath ? absoluteUrl(imagePath) : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: siteConfig.brandName,
      title,
      description,
      url,
      locale: "en_IN",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * Title template shared by every route. The venue's working name is used until
 * the confirmed trade name is configured.
 */
export function titleTemplate(pageTitle: string): string {
  return `${pageTitle} · ${siteConfig.brandName}`;
}
