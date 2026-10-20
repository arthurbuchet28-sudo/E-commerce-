import { useState } from "react";

// Image that swaps to a dark gradient with a label if it fails to load.
export default function SafeImage({ src, alt, fallbackLabel, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`vl-img-wrap ${className}`.trim()}>
      {failed ? (
        <div className="vl-img-fallback" role="img" aria-label={alt}>
          {fallbackLabel}
        </div>
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}
