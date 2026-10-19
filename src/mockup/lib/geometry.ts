import { LID_H, LID_W } from "../../site/components/Laptop";

/**
 * Projection manuelle d'un point du laptop vers l'écran, en reproduisant exactement
 * les transformations CSS appliquées au laptop :
 *   perspective(P) · translate3d(tx, ty, 0) · scale(s) · rotateX(rx) · rotateY(ry)
 * (origine = centre du capot, lui-même centré dans l'image).
 * Repère CSS : x à droite, y vers le bas, z vers la caméra.
 */
export type LaptopPose = { tx: number; ty: number; s: number; rx: number; ry: number };

export const PERSPECTIVE = 2600;

export const project = (pose: LaptopPose, p: { x: number; y: number; z: number }, W: number, H: number) => {
  const ry = (pose.ry * Math.PI) / 180;
  const rx = (pose.rx * Math.PI) / 180;
  // rotateY
  const x1 = p.x * Math.cos(ry) + p.z * Math.sin(ry);
  const z1 = -p.x * Math.sin(ry) + p.z * Math.cos(ry);
  const y1 = p.y;
  // rotateX
  const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
  // scale + translate
  const x3 = x1 * pose.s + pose.tx;
  const y3 = y2 * pose.s + pose.ty;
  const z3 = z2; // attention : en CSS, scale(s) est un scale 2D, il ne touche pas l'axe Z
  const k = PERSPECTIVE / (PERSPECTIVE - z3);
  return { x: W / 2 + x3 * k, y: H / 2 + y3 * k, k: k * pose.s };
};

/**
 * Point du dessus de la base (repère « clavier » : u horizontal depuis le centre,
 * v = distance depuis la charnière vers l'avant) exprimé dans le repère du capot.
 * La base est accrochée sous le capot (y = LID_H) et rabattue de 90° vers la caméra.
 */
export const basePoint = (u: number, v: number) => ({ x: u, y: LID_H / 2, z: v });

/** Centre du trackpad dans le repère de la base (cf. Laptop3D : 540×330, à 40 px du bord avant). */
export const TRACKPAD = { u: 0, v: 900 - 40 - 165, w: 540, h: 330 };

export { LID_W, LID_H };
