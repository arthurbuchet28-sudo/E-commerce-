import "server-only";

import { createHash } from "node:crypto";

import { serverEnv } from "@/lib/env.server";

/** What the lesson player needs: an embeddable URL, or nothing (placeholder shown). */
export type Playback = { kind: "iframe"; src: string; expiresAt: number } | null;

export interface VideoProvider {
  playback(videoId: string | null): Playback;
}

/** Local development: no video hosting, the player shows a placeholder and the transcript. */
export const mockVideoProvider: VideoProvider = { playback: () => null };

/**
 * Bunny Stream token authentication: SHA256_HEX(token_key + video_id + expires).
 * [À VÉRIFIER — documentation Bunny Stream « Embed view token authentication »]
 */
export function bunnyToken(tokenKey: string, videoId: string, expires: number): string {
  return createHash("sha256").update(`${tokenKey}${videoId}${expires}`).digest("hex");
}

export function bunnyVideoProvider(
  libraryId: string,
  tokenKey: string,
  ttlSeconds = 3600,
): VideoProvider {
  return {
    playback(videoId) {
      if (!videoId) return null;
      const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
      const params = new URLSearchParams({
        token: bunnyToken(tokenKey, videoId, expires),
        expires: String(expires),
        autoplay: "false",
        preload: "false",
      });
      return {
        kind: "iframe",
        src: `https://iframe.mediadelivery.net/embed/${encodeURIComponent(libraryId)}/${encodeURIComponent(videoId)}?${params}`,
        expiresAt: expires,
      };
    },
  };
}

export function videoProvider(): VideoProvider {
  const env = serverEnv();
  if (env.VIDEO_PROVIDER === "bunny" && env.BUNNY_STREAM_LIBRARY_ID && env.BUNNY_STREAM_TOKEN_KEY) {
    return bunnyVideoProvider(env.BUNNY_STREAM_LIBRARY_ID, env.BUNNY_STREAM_TOKEN_KEY);
  }
  return mockVideoProvider;
}
