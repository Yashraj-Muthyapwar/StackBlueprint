import { useEffect, useState } from "react";
import { Lightbulb } from "@theme-toggles/react";
import "@theme-toggles/react/styles/lightbulb.css";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or default to light
    const storedTheme = localStorage.getItem("theme");
    
    // We default to light if no preference is found
    const initialDark = storedTheme === "dark";
    
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div
      onClick={toggleTheme}
      className={`group flex items-center justify-center w-9 h-9 rounded-md cursor-pointer transition-all duration-200 ${
        isDark ? "hover:bg-slate-800 hover:scale-105" : "hover:bg-slate-100 hover:scale-105"
      }`}
      aria-label="Toggle theme"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      <div 
        className={`relative z-10 text-[1.4rem] transition-all duration-300 ${
          !isDark 
            ? "text-[#ea580c] drop-shadow-[0_0_8px_rgba(234,88,12,0.5)] group-hover:text-[#f97316] group-hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" 
            : "text-slate-400 group-hover:text-slate-200 group-hover:drop-shadow-[0_0_8px_rgba(226,232,240,0.5)]"
        }`}
      >
        {(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const AnyLightbulb = Lightbulb as any;
          return (
            <AnyLightbulb
              className="pointer-events-none" 
            />
          );
        })()}
      </div>
    </div>
  );
}
