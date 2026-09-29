import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "./cn";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-ui font-sans font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-on-ink hover:bg-ink/90",
  secondary: "border border-ink bg-sheet text-ink hover:bg-ink-soft",
  quiet: "text-ink underline underline-offset-4 decoration-1 hover:decoration-2",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 py-2 text-ui",
  lg: "min-h-12 px-5 py-3 text-ui",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], variant !== "quiet" && sizes[size], className);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = {
  href: Route;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ href, variant, size, className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
