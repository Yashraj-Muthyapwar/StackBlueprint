import { useState, useEffect, useRef, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface ZoomableImageProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
}

export function ZoomableImage({ src, alt, caption, className }: ZoomableImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusedElement = useRef<HTMLElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);

  const dialogId = useId();
  const captionId = `${dialogId}-caption`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll and manage focus on open/close
  useEffect(() => {
    if (!isZoomed) return;

    // Save previously focused element to restore when closed
    prevFocusedElement.current = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button once dialog is mounted
    const focusTimer = requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [isZoomed]);

  const closeModal = useCallback(() => {
    setIsZoomed(false);
    setScale(1);
    setPan({ x: 0, y: 0 });
    // Restore focus to trigger button
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(4, +(s + 0.5).toFixed(1)));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(1, +(s - 0.5).toFixed(1));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard trap, escape, and shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
        return;
      }

      // Focus trap within modal
      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }

      // Zoom & pan keyboard shortcuts
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0" || e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetZoom();
      } else if (scale > 1) {
        const step = 40;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPan((p) => ({ ...p, x: p.x + step }));
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setPan((p) => ({ ...p, x: p.x - step }));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setPan((p) => ({ ...p, y: p.y + step }));
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setPan((p) => ({ ...p, y: p.y - step }));
        }
      }
    },
    [closeModal, zoomIn, zoomOut, resetZoom, scale]
  );

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else if (e.deltaY > 0) {
      zoomOut();
    }
  };

  // Mouse drag panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        // Double tap toggles 1x and 2x
        setScale((s) => (s > 1 ? 1 : 2));
        setPan({ x: 0, y: 0 });
      }
      lastTapTime.current = now;

      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      setPan({
        x: dragStart.current.panX + dx,
        y: dragStart.current.panY + dy,
      });
    } else if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / lastTouchDist.current;
      setScale((s) => {
        const next = Math.min(4, Math.max(1, +(s * factor).toFixed(2)));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
      lastTouchDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDist.current = null;
  };

  const labelText = caption || alt || "Illustration";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsZoomed(true)}
        aria-haspopup="dialog"
        aria-expanded={isZoomed}
        aria-label={`Enlarge image: ${labelText}`}
        className="group relative inline-flex w-full items-center justify-center max-w-full cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <img
          src={src}
          alt={alt}
          className={`transition-transform duration-200 group-hover:scale-[1.015] ${className || ""}`}
        />
        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 font-mono text-[11px] font-medium text-white shadow-sm backdrop-blur-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="size-3.5" />
          <span>Click to enlarge</span>
        </span>
      </button>

      {isZoomed &&
        mounted &&
        createPortal(
          <div
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged view: ${labelText}`}
            aria-describedby={caption ? captionId : undefined}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 z-[999] flex flex-col bg-slate-950/90 backdrop-blur-md outline-none"
          >
            {/* Top Toolbar */}
            <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs font-medium text-slate-200">
                  {Math.round(scale * 100)}%
                </span>
                <span className="hidden font-mono text-xs text-slate-400 sm:inline">
                  {scale > 1 ? "Drag or Arrow keys to pan" : "Click image or toolbar to zoom"}
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={scale <= 1}
                  title="Zoom out (-)"
                  aria-label="Zoom out"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ZoomOut className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={scale >= 4}
                  title="Zoom in (+)"
                  aria-label="Zoom in"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ZoomIn className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  disabled={scale === 1 && pan.x === 0 && pan.y === 0}
                  title="Reset zoom (0)"
                  aria-label="Reset zoom"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-mono font-medium text-slate-200 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeModal}
                  title="Close (Escape)"
                  aria-label="Close enlarged view"
                  className="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-rose-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="size-5" />
                </button>
              </div>
            </header>

            {/* Main Image Canvas Viewport */}
            <div
              className={`relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-6 select-none ${
                scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              onClick={(e) => {
                // Clicking background area when not dragging closes modal
                if (e.target === e.currentTarget && scale === 1) {
                  closeModal();
                }
              }}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  maxHeight: "calc(100vh - 160px)",
                  maxWidth: "95vw",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (scale === 1) {
                    setScale(2);
                  } else if (scale > 1 && !isDragging) {
                    setScale(1);
                    setPan({ x: 0, y: 0 });
                  }
                }}
                className="rounded-lg object-contain shadow-2xl drop-shadow-2xl select-none"
              />
            </div>

            {/* Bottom Caption Bar */}
            {(caption || alt) && (
              <footer className="relative z-10 border-t border-white/10 bg-slate-950/85 px-4 py-3 sm:px-6">
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-1 text-center">
                  <p
                    id={captionId}
                    className="text-xs sm:text-sm font-medium text-slate-100 max-w-prose"
                  >
                    {caption || alt}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    Use + / - to zoom · Drag to pan · Esc to close
                  </p>
                </div>
              </footer>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
