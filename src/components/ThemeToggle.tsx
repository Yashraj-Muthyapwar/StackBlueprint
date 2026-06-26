import { useEffect, useState } from "react";
import { Lightbulb, LightbulbOff } from "lucide-react";

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
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-500 ${
        !isDark ? "bg-amber/15 hover:bg-amber/25" : "bg-surface hover:bg-surface-2"
      }`}
      aria-label="Toggle theme"
    >
      {!isDark ? (
        <Lightbulb 
          className="size-5 text-amber transition-all duration-500 scale-110 drop-shadow-[0_0_10px_#F5A524]" 
          fill="#F5A524"
        />
      ) : (
        <LightbulbOff 
          className="size-5 text-muted-foreground transition-all duration-500 scale-95" 
        />
      )}
    </button>
  );
}
