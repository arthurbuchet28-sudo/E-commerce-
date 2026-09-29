import "server-only";

import { evaluate, type EvaluateOptions } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/**
 * Compiles and renders trusted MDX from the repository (never user input) at build time.
 * Headings get github-slugger ids (same as extractHeadings) for the table of contents.
 */
export async function renderMdx(source: string, components: MDXComponents) {
  const { default: Content } = await evaluate(source, {
    ...(runtime as EvaluateOptions),
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  });
  return <Content components={components} />;
}
