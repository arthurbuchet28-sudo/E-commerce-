"use client";

import { Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/components/ui/cn";

import { SearchDialog } from "./SearchDialog";

type NavItem = { href: Route; label: string };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Main navigation: inline on desktop, disclosure menu on mobile. */
export function SiteNav({ items, account }: { items: NavItem[]; account: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const link = (item: NavItem, mobile: boolean) => (
    <Link
      href={item.href}
      aria-current={isActive(pathname, item.href) ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center rounded-ui px-3 hover:bg-ink-soft aria-[current=page]:font-semibold aria-[current=page]:text-ink",
        mobile && "w-full border-b border-line px-1 last:border-0",
        !mobile &&
          "aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8",
      )}
    >
      {item.label}
    </Link>
  );

  return (
    <>
      <nav aria-label="Navigation principale" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => (
            <li key={item.href}>{link(item, false)}</li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <SearchDialog />
        <Link
          href={account.href}
          className="hidden min-h-11 items-center rounded-ui border border-ink px-4 font-semibold text-ink hover:bg-ink-soft sm:flex"
        >
          {account.label}
        </Link>
        <button
          type="button"
          className="flex min-h-11 items-center gap-2 rounded-ui border border-border px-3 md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          Menu
        </button>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Navigation principale (mobile)"
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-y border-line bg-sheet px-4 pb-4 md:hidden"
      >
        <ul className="flex flex-col">
          {[...items, account].map((item) => (
            <li key={item.href}>{link(item, true)}</li>
          ))}
        </ul>
      </nav>
    </>
  );
}
