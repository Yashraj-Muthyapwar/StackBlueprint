import { useState, useEffect, useRef } from "react";
import { BookOpen, GripHorizontal } from "lucide-react";

export interface TOCItem {
  id: string;
  targetId: string;
  title: string;
  index: number;
}

export interface FloatingTOCProps {
  items: TOCItem[];
}

export function FloatingTOC({ items }: FloatingTOCProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: 0, // Lock X axis to keep it on the side
      y: posStart.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Keep it within vertical screen bounds
    const element = (e.target as HTMLElement).closest(".fixed");
    if (element) {
      const rect = element.getBoundingClientRect();
      let newY = position.y;

      // Clamp to top/bottom with 24px padding
      if (rect.top < 24) {
        newY = position.y + (24 - rect.top);
      } else if (rect.bottom > window.innerHeight - 24) {
        newY = position.y - (rect.bottom - (window.innerHeight - 24));
      }

      setPosition({ x: 0, y: newY });
    }
  };

  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      const headingElements = items
        .map((item) => ({
          item,
          el: document.getElementById(item.targetId),
        }))
        .filter((x) => x.el !== null);

      if (headingElements.length === 0) return;

      const scrollPosition = window.scrollY + 120; // Offset for navbar and padding

      let currentActiveId = headingElements[0].item.id;

      for (const { item, el } of headingElements) {
        const top = el!.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPosition) {
          currentActiveId = item.id;
        } else {
          break;
        }
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end lg:bottom-auto lg:top-32"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none",
      }}
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      <div
        className={`group flex flex-col items-end overflow-hidden rounded-2xl border border-foreground/10 dark:border-white/10 bg-surface/95 dark:bg-white/[0.03] shadow-xl backdrop-blur-md transition-all duration-500 ease-in-out ${
          isHovered ? "w-64" : "w-12 h-12"
        }`}
      >
        <div
          className={`flex h-12 w-full shrink-0 items-center justify-between px-3 transition-colors cursor-pointer ${
            isHovered ? "bg-surface/50" : ""
          } ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`}
          onClick={() => !isDragging && setIsHovered(!isHovered)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className={`flex items-center gap-2 overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0 w-0"}`}
          >
            <GripHorizontal className="size-3.5 text-muted-foreground/50 mr-1" />
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-mint select-none">
              Table of Contents
            </span>
          </div>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            <BookOpen className="size-4 pointer-events-none text-foreground/60 transition-colors group-hover:text-foreground" />
          </div>
        </div>

        <div
          className={`w-full flex-1 overflow-y-auto transition-all duration-500 ${
            isHovered ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="relative flex flex-col gap-1 p-3 pt-0">
            {/* Connecting Timeline Line */}
            <div className="absolute bottom-6 left-[31px] top-5 w-px bg-hairline/60 -z-10" />

            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToSection(item.targetId);
                  }}
                  className={`group/btn relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-mint/10 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex h-5 w-4 shrink-0 items-center justify-center relative">
                    <div
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-mint scale-125 shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                          : "bg-muted-foreground/40 scale-75 group-hover/btn:scale-100 group-hover/btn:bg-foreground/50"
                      }`}
                    />
                  </div>
                  <span className="line-clamp-2 leading-tight transition-transform duration-300 group-hover/btn:translate-x-0.5">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
