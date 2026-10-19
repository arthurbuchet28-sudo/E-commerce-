import React from "react";

type P = { size?: number; color?: string; fill?: boolean };
const S: React.FC<P & { children: React.ReactNode; sw?: number }> = ({ size = 24, color = "#fff", fill, children, sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const Heart: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4z" />
  </S>
);
export const Comment: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M4 5.5h16v10.5H9l-5 4z" />
  </S>
);
export const Share: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M13 5l7 6.5-7 6.5v-4c-5 0-8 1.5-10 5 .5-6 4-9.5 10-10z" />
  </S>
);
export const Eye: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);
export const UserPlus: React.FC<P> = (p) => (
  <S {...p}>
    <circle cx="9" cy="8" r="3.6" />
    <path d="M2.5 20c.8-3.6 3.3-5.6 6.5-5.6s5.7 2 6.5 5.6M19 8v6M16 11h6" />
  </S>
);
export const Check: React.FC<P> = (p) => (
  <S {...p} sw={3}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </S>
);
export const Clock: React.FC<P> = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </S>
);
export const Bolt: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </S>
);
export const Trend: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </S>
);
export const Arrow: React.FC<P> = (p) => (
  <S {...p} sw={2.6}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </S>
);
