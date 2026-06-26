import { useEffect, useState } from "react";
import { Lightbulb } from "@theme-toggles/react";
import "@theme-toggles/react/styles/lightbulb.css";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme from localStorage or default to dark
    const storedTheme = localStorage.getItem("theme");
    
    // We default to dark if no preference is found
    const initialDark = storedTheme ? storedTheme === "dark" : true;
    
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
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center p-2 rounded-full transition-colors duration-300 hover:bg-muted/50"
      aria-label="Toggle theme"
    >
      <div 
        className={`text-[1.35rem] transition-all duration-500 ${
          !isDark 
            ? "text-amber drop-shadow-[0_0_12px_rgba(245,165,36,0.8)] scale-110" 
            : "text-muted-foreground scale-100"
        }`}
      >
        <Lightbulb 
          toggled={!isDark}
          toggle={setIsDark}
          forceSelected={!isDark}
          className="pointer-events-none" 
        />
      </div>
    </button>
  );
}
