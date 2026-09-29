import { siteConfig } from "@/config/site";
import type { EmailMessage } from "@/lib/services/email";

/**
 * Plain-text-first e-mails: the text version is the reference; the HTML version is the same
 * paragraphs, escaped, with links made clickable. Pure functions (unit-tested).
 */

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const URL_IN_TEXT = /https?:\/\/[^\s<]+[^\s<.,;:!?)»]/g;

export function paragraphToHtml(p: string): string {
  const html = escapeHtml(p)
    .replace(URL_IN_TEXT, (url) => `<a href="${url}">${url}</a>`)
    .replaceAll("\n", "<br>");
  return `<p>${html}</p>`;
}

export function composeEmail(
  to: string,
  subject: string,
  paragraphs: string[],
  headers?: Record<string, string>,
): EmailMessage {
  const body = paragraphs.map(paragraphToHtml).join("\n");
  return {
    to,
    subject,
    text: paragraphs.join("\n\n"),
    html: `<!doctype html><html lang="fr"><body style="font-family:sans-serif;line-height:1.5;max-width:40rem">${body}</body></html>`,
    ...(headers && { headers }),
  };
}

export function hello(name: string | null): string {
  return name ? `Bonjour ${name},` : "Bonjour,";
}

export const signature = `À bientôt,\n${siteConfig.name}`;
