/**
 * URL helpers.
 *
 * Every piece of state the visitor chooses — the date they are looking at, the
 * language and format they filtered by — travels in the query string. That
 * makes every view shareable, bookmarkable, back-button-friendly and reachable
 * without JavaScript, and it means the ticketing handoff carries the same
 * context the visitor was actually looking at.
 */

export type FilterParams = {
  date?: string;
  language?: string;
  format?: string;
};

const ALLOWED_KEYS = ["date", "language", "format"] as const;

/** Builds a root-relative href, dropping empty values and ordering keys. */
export function buildHref(basePath: string, params: FilterParams): string {
  const search = new URLSearchParams();

  for (const key of ALLOWED_KEYS) {
    const value = params[key];
    if (value) search.set(key, value);
  }

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/**
 * Reads filters out of a page's searchParams. Unknown values are ignored rather
 * than passed through, so a hand-edited URL cannot inject arbitrary query data
 * into links this site generates.
 */
export function readFilterParams(
  searchParams: Record<string, string | string[] | undefined>,
  allowed: { languages?: string[]; formats?: string[] } = {},
): FilterParams {
  const readOne = (key: string): string | undefined => {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.trim() || undefined;
  };

  const date = readOne("date");
  const language = readOne("language");
  const format = readOne("format");

  return {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    language:
      language && (!allowed.languages || allowed.languages.includes(language))
        ? language
        : undefined,
    format: format && (!allowed.formats || allowed.formats.includes(format)) ? format : undefined,
  };
}
