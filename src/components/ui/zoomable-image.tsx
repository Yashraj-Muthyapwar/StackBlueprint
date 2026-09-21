import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function ZoomableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setIsZoomed(true)}
        className={`cursor-zoom-in transition-transform duration-200 hover:scale-[1.015] ${className || ""}`}
      />
      {isZoomed && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute right-6 top-6 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            aria-label="Close fullscreen image"
          >
            <X className="size-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
          />
        </div>
      )}
    </>
  );
}
