import Link from "next/link";

import { footerNav, getRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-sheet">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <p className="font-serif text-lg font-semibold text-ink">{siteConfig.name}</p>
          <p className="text-small text-muted">
            Contenus informatifs, à jour à la date indiquée sur chaque page. Ils ne remplacent pas
            l’avis d’un expert-comptable ou d’un avocat.
          </p>
        </div>
        {footerNav.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 font-sans text-ui font-semibold text-text">{col.title}</h2>
            <ul className="flex flex-col gap-1">
              {col.paths.map((p) => (
                <li key={p}>
                  <Link href={p} className="link inline-flex min-h-8 items-center text-small">
                    {getRoute(p).label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-small sm:px-6">
          <Link href="/retractation" className="link font-semibold">
            Se rétracter
          </Link>
          {/* The preference centre is wired in phase 12; the link is permanent from now on. */}
          <Link href="/cookies#preferences" className="link">
            Gérer mes cookies
          </Link>
          <p className="text-muted sm:ml-auto">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
