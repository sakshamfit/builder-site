/**
 * Environment helpers.
 *
 * One pair of readers for the whole project, so "an empty string is not a value"
 * is decided once. Every configuration value on this site is an owner decision:
 * an unset variable must degrade to an honest "not confirmed" state, never to a
 * guess, and `""` must behave exactly like "unset" — a convention that is easy to
 * get wrong per call site, which is why it lives here.
 */

/** Trimmed value, or empty string when unset. */
export function readEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Comma-separated values, trimmed and lower-cased, with empties removed. */
export function readList(value: string | undefined): string[] {
  return readEnv(value)
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}
