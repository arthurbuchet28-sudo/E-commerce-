import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const OG_SIZE = { width: 1200, height: 630 };

// Static WOFF files (satori does not read WOFF2), same families as the site.
const fontDir = join(process.cwd(), "src/app/fonts/og");

/** Social preview in the site's visual language: ink, paper, sage itinerary line. */
export async function renderOgImage({ title, kicker }: { title: string; kicker: string }) {
  const [serif, sans] = await Promise.all([
    readFile(join(fontDir, "literata-latin-600-normal.woff")),
    readFile(join(fontDir, "atkinson-hyperlegible-next-latin-400-normal.woff")),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#F4F7FB",
        padding: "72px 80px",
        fontFamily: "Atkinson",
        color: "#262A31",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 48 }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 14, background: "#3F6B55" }} />
        <div style={{ width: 6, flexGrow: 1, background: "#3F6B55" }} />
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: "6px solid #1C2B4B",
            background: "#FFFFFF",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div style={{ fontSize: 30, color: "#4A5363" }}>{kicker}</div>
        <div
          style={{
            fontFamily: "Literata",
            fontSize: title.length > 70 ? 54 : 64,
            color: "#1C2B4B",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div style={{ fontFamily: "Literata", fontSize: 34, color: "#1C2B4B" }}>
          {siteConfig.name}
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Literata", data: serif, weight: 600, style: "normal" },
        { name: "Atkinson", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
