import { getRoute, mainNav } from "@/config/routes";

import { Logo } from "./Logo";
import { SiteNav } from "./SiteNav";

export function SiteHeader() {
  const items = mainNav.map((p) => ({ href: p, label: getRoute(p).label }));
  return (
    <header className="relative border-b border-line bg-sheet">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <SiteNav items={items} account={{ href: "/compte", label: "Mon compte" }} />
      </div>
    </header>
  );
}
