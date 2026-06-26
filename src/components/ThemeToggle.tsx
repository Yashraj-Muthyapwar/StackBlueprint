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
      className="flex items-center justify-center p-2 rounded-full"
      aria-label="Toggle theme"
    >
      <div 
        className={`text-[1.35rem] ${
          !isDark 
            ? "text-[#d97706]" // bold amber-600 color for strong glowing effect
            : "text-muted-foreground"
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
