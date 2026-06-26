import { useEffect, useState } from "react";
import { Lightbulb, LightbulbOff } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isPulling, setIsPulling] = useState(false);

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
    // Add a short delay to simulate the physical "pull" before the click registers
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
      const newDark = !isDark;
      setIsDark(newDark);
      if (newDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, 150);
  };

  return (
    <div className="group relative flex flex-col items-center mt-6">
      {/* The Bulb */}
      <button
        onClick={toggleTheme}
        className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
          isPulling ? "translate-y-1" : ""
        }`}
        aria-label="Toggle theme"
      >
        {!isDark ? (
          <Lightbulb 
            className="size-5 text-amber drop-shadow-[0_0_12px_#F5A524] transition-all duration-300" 
            fill="#F5A524"
          />
        ) : (
          <LightbulbOff 
            className="size-5 text-muted-foreground transition-all duration-300" 
          />
        )}
      </button>

      {/* The Pull String */}
      <div 
        onClick={toggleTheme}
        className={`cursor-pointer flex flex-col items-center transition-all duration-300 ${
          isPulling ? "translate-y-3" : "translate-y-0"
        } -mt-0.5 group-hover:translate-y-1`}
      >
        <div className="h-6 w-[1.5px] bg-muted-foreground/40" />
        <div className="size-2 rounded-full bg-muted-foreground shadow-sm" />
      </div>
    </div>
  );
}
