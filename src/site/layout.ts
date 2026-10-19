import { useVideoConfig } from "remotion";

/** Infos de mise en page : les scènes s'adaptent au format (16:9 paysage ou 9:16 TikTok). */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  return { W: width, H: height, cx: width / 2, cy: height / 2, vertical: height > width };
};
