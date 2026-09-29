import GithubSlugger from "github-slugger";

export type Heading = { depth: 2 | 3; text: string; id: string };

/** Removes fenced code, JSX tags, Markdown syntax: approximates the words a reader reads. */
export function plainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`|-]/g, " ");
}

export function wordCount(mdx: string): number {
  return plainText(mdx)
    .split(/\s+/)
    .filter((w) => /[\p{L}\d]/u.test(w)).length;
}

/** Minutes of reading at 220 words per minute, at least 1. */
export function readingMinutes(mdx: string): number {
  return Math.max(1, Math.round(wordCount(mdx) / 220));
}

/** h2/h3 headings with the same ids as rehype-slug (github-slugger). */
export function extractHeadings(mdx: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of mdx.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (match) {
      const text = match[2].replace(/[*_`]/g, "");
      headings.push({ depth: match[1].length as 2 | 3, text, id: slugger.slug(text) });
    }
  }
  return headings;
}
