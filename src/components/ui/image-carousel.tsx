import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ZoomableImage } from "@/components/ui/zoomable-image";

export function ImageCarousel({
  images,
}: {
  images: { src: string; alt: string; caption?: string }[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const interval = setInterval(next, 12000); // 12 seconds auto-scroll
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <figure
      className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full flex justify-center bg-surface-2/30 py-4 relative min-h-[300px] items-center">
        <ZoomableImage
          key={currentImage.src}
          src={currentImage.src}
          alt={currentImage.alt}
          className="h-auto w-full max-w-full object-contain px-4 lg:max-w-4xl"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-800/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800 backdrop-blur-sm shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-800/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800 backdrop-blur-sm shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === currentIndex ? "bg-white w-4" : "bg-white/50 w-2 hover:bg-white/75"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {currentImage.caption ? (
        <figcaption className="border-t border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-all duration-300">
          {currentImage.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
