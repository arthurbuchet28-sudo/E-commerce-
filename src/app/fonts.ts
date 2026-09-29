import localFont from "next/font/local";

// Self-hosted fonts (SIL OFL, see LICENSE-*.txt). No request to a third-party CDN.

/** Literata — long-form reading (guides, lessons) and headings. */
export const fontSerif = localFont({
  src: [
    { path: "./fonts/literata-latin-wght-normal.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/literata-latin-wght-italic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-literata",
  display: "swap",
});

/** Atkinson Hyperlegible Next — interface, forms, tools and figures. */
export const fontSans = localFont({
  src: [
    {
      path: "./fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./fonts/atkinson-hyperlegible-next-latin-wght-italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-atkinson",
  display: "swap",
});
