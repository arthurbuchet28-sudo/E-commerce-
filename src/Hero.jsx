import { useEffect, useRef } from "react";

const VIDEO_SRC =
  "https://cdn.sceneai.art/Hero%20section%20video%20file%20(2)/37091057-3719-4207-815c-745ebf57aeb4.mp4";

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap");

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; background: #0a0a0b; }
html { scroll-behavior: smooth; }
body { font-family: "Archivo", sans-serif; -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
a:hover { color: #fff; }

.vl-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
  background: #0a0a0b;
  font-family: "Archivo", sans-serif;
}

.vl-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 60%;
  pointer-events: none;
}

.vl-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0.15) 30%, rgba(8,8,10,0.25) 55%, rgba(8,8,10,0.92) 100%);
}

.vl-nav {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34px 56px;
}

.vl-nav-left { display: flex; align-items: center; gap: 42px; }
.vl-links { display: flex; align-items: center; gap: 42px; list-style: none; }
.vl-links a {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.82);
  transition: color .2s ease;
}
.vl-links a:hover { color: #fff; }
.vl-links a.is-active {
  color: #fff;
  border-bottom: 2px solid #fff;
  padding-bottom: 3px;
}

.vl-logo {
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.vl-browse {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  color: #FAF9F5;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 20px;
  border-radius: 10px;
  transition: background .25s ease, color .25s ease;
}
.vl-browse:hover { background: #e9e9ec; color: #0a0a0b; }
.vl-browse span, .vl-cta span { font-size: 15px; line-height: 1; }

.vl-headline {
  position: absolute;
  top: 92px;
  left: 0;
  width: 100%;
  z-index: 2;
  text-align: center;
  font-weight: 800;
  font-size: 13.3vw;
  line-height: 0.9;
  letter-spacing: -0.03em;
  white-space: nowrap;
  background: linear-gradient(180deg, #ffffff 55%, #b8b8bd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  pointer-events: none;
  user-select: none;
}

.vl-copy {
  position: absolute;
  left: 56px;
  bottom: 56px;
  z-index: 3;
  max-width: 620px;
}
.vl-copy h1 {
  color: #fff;
  font-weight: 600;
  font-size: clamp(38px, 5.8vw, 66px);
  line-height: 0.98;
  letter-spacing: -0.02em;
}
.vl-copy p {
  color: rgba(255,255,255,0.82);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  max-width: 480px;
  margin-top: 18px;
}
.vl-cta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 13px 24px;
  border-radius: 10px;
  transition: background .25s ease, color .25s ease, border-color .25s ease;
}
.vl-cta:hover { background: #fff; color: #0a0a0b; border-color: #fff; }

/* Tablet */
@media (max-width: 1024px) {
  .vl-nav { padding: 28px 32px; }
  .vl-nav-left, .vl-links { gap: 28px; }
  .vl-copy { left: 32px; right: 32px; bottom: 40px; }
}

/* Mobile */
@media (max-width: 680px) {
  .vl-hero { min-height: 640px; }
  .vl-nav {
    padding: 20px;
    flex-wrap: wrap;
    row-gap: 16px;
  }
  .vl-nav-left { display: contents; }
  .vl-logo { order: 1; }
  .vl-browse { order: 2; }
  .vl-links { order: 3; width: 100%; gap: 22px; flex-wrap: wrap; }
  .vl-links a { font-size: 13px; }
  .vl-logo { font-size: 22px; }
  .vl-browse { padding: 9px 14px; font-size: 13px; gap: 8px; }
  .vl-headline { top: 124px; }
  .vl-copy { left: 20px; right: 20px; bottom: 32px; }
  .vl-copy p { font-size: 14px; }
  .vl-cta { margin-top: 24px; }
}

@media (max-width: 360px) {
  .vl-links { gap: 14px; }
  .vl-browse { padding: 8px 12px; }
}
`;

const NAV_LINKS = [
  { id: "accueil", label: "Accueil" },
  { id: "a-propos", label: "À propos" },
  { id: "voitures", label: "Voitures" },
  { id: "contact", label: "Contact" },
];

export default function Hero({ activeSection = "accueil" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const onVisibility = () => {
      if (!document.hidden) play();
    };

    const events = ["pause", "ended", "loadedmetadata", "canplay"];
    events.forEach((e) => video.addEventListener(e, play));
    document.addEventListener("visibilitychange", onVisibility);

    play();
    const watchdog = setInterval(() => {
      if (video.paused) play();
    }, 1000);

    return () => {
      clearInterval(watchdog);
      events.forEach((e) => video.removeEventListener(e, play));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section className="vl-hero" id="accueil">
      <style>{styles}</style>

      <video
        ref={videoRef}
        className="vl-video"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      <div className="vl-overlay" />

      <nav className="vl-nav">
        <div className="vl-nav-left">
          <ul className="vl-links">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={activeSection === link.id ? "is-active" : undefined}
                  aria-current={activeSection === link.id ? "true" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#accueil" className="vl-logo">VELORA</a>
        </div>
        <a href="#voitures" className="vl-browse">
          Voir les voitures <span>→</span>
        </a>
      </nav>

      <div className="vl-headline" aria-hidden="true">REGAL DRIVE</div>

      <div className="vl-copy">
        <h1>Louez la voiture de luxe de vos rêves dès aujourd'hui</h1>
        <p>
          Profitez d'une expérience de location haut de gamme : voitures
          d'exception, réservation simple et prix transparents.
        </p>
        <a href="#voitures" className="vl-cta">
          DÉCOUVRIR <span>↗</span>
        </a>
      </div>
    </section>
  );
}
