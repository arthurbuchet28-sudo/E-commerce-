"use client";

import { Fragment, type ReactNode } from "react";

import { useSearch } from "./useInitialInputs";

/**
 * Renders a tool with its default values first (prerendered HTML, hydration), then remounts it
 * with the values of a reopened simulation when the URL carries some.
 */
export function UrlKeyed({ children }: { children: ReactNode }) {
  return <Fragment key={useSearch()}>{children}</Fragment>;
}
