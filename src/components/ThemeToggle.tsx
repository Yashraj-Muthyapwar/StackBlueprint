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
      className="flex items-center justify-center p-2 rounded-full cursor-pointer"
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
        className={`text-[1.35rem] ${
          !isDark 
            ? "text-[#d97706]" // bold amber-600 color for strong glowing effect
            : "text-muted-foreground"
        }`}
      >
        {(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const AnyLightbulb = Lightbulb as any;
          return (
            <AnyLightbulb
              toggled={!isDark}
              toggle={setIsDark}
              forceSelected={!isDark}
              className="pointer-events-none" 
            />
          );
        })()}
      </div>
    </div>
  );
}
