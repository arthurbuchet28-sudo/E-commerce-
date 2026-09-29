import type { ReactNode } from "react";

type VideoPlayerProps = {
  title: string;
  /** Signed, expiring URL (Bunny Stream) resolved server-side; null shows a placeholder. */
  src: string | null;
  captionsSrc?: string;
  poster?: string;
  /** Mandatory text transcript (accessibility). */
  transcript: ReactNode;
};

/** Never autoplays. Captions (VTT) on by default; transcript always available below. */
export function VideoPlayer({ title, src, captionsSrc, poster, transcript }: VideoPlayerProps) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="aspect-video overflow-hidden rounded-ui border border-line bg-ink-soft">
        {src ? (
          <video controls preload="none" poster={poster} className="size-full" aria-label={title}>
            <source src={src} />
            {captionsSrc && (
              <track kind="captions" src={captionsSrc} srcLang="fr" label="Français" default />
            )}
          </video>
        ) : (
          <div className="flex size-full items-center justify-center p-4 text-center text-muted">
            Vidéo à venir. La transcription ci-dessous contient l’intégralité du contenu.
          </div>
        )}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
      <details className="rounded-ui border border-line bg-sheet">
        <summary className="min-h-11 cursor-pointer px-4 py-3 font-semibold">
          Lire la transcription
        </summary>
        <div className="prose-guide px-4 pb-4">{transcript}</div>
      </details>
    </figure>
  );
}
