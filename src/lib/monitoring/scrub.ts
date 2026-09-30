/**
 * Data minimisation for error reports (GDPR): an error report must be enough to fix a bug,
 * never a copy of personal data. Pure functions, used before anything leaves the server.
 */

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Long hexadecimal or base64url strings: tokens, session ids, signatures.
const TOKEN = /\b[A-Za-z0-9_-]{32,}\b/g;
const MAX_MESSAGE = 500;

/** Path only: query strings and fragments carry tokens (newsletter, e-mail links). */
export function scrubPath(url: string): string {
  const path = url.split(/[?#]/)[0] || "/";
  return path.slice(0, 300);
}

export function scrubText(text: string): string {
  return text.replace(EMAIL, "[e-mail]").replace(TOKEN, "[jeton]").slice(0, MAX_MESSAGE);
}

/** Minimal shape of a Sentry event: only the fields this module touches. */
export type ReportEvent = {
  message?: string;
  user?: unknown;
  server_name?: string;
  request?: {
    url?: string;
    query_string?: unknown;
    cookies?: unknown;
    headers?: unknown;
    data?: unknown;
    env?: unknown;
  };
  exception?: { values?: Array<{ value?: string }> };
  breadcrumbs?: unknown;
};

/**
 * Sentry `beforeSend`: removes the user, cookies, headers, bodies, query strings and
 * breadcrumbs (they may contain form input), and masks e-mails and tokens in messages.
 */
export function scrubEvent<T extends ReportEvent>(event: T): T {
  delete event.user;
  delete event.server_name;
  delete event.breadcrumbs;
  if (event.request) {
    event.request = event.request.url ? { url: scrubPath(event.request.url) } : {};
  }
  if (event.message) event.message = scrubText(event.message);
  for (const v of event.exception?.values ?? []) {
    if (v.value) v.value = scrubText(v.value);
  }
  return event;
}
