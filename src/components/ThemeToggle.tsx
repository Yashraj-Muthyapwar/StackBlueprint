import { useEffect, useState } from "react";
import { Lightbulb } from "@theme-toggles/react";
import "@theme-toggles/react/styles/lightbulb.css";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);

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
    if (isPulling) return;
    
    // Add a short delay to simulate the physical "pull" before the click registers
    setIsPulling(true);
    setIsSwinging(false);
    
    setTimeout(() => {
      setIsPulling(false);
      setIsSwinging(true);
      
      const newDark = !isDark;
      setIsDark(newDark);
      if (newDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      
      // Stop swinging after animation completes
      setTimeout(() => setIsSwinging(false), 1000);
    }, 200);
  };

  return (
    <>
      <style>{`
        @keyframes swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-3deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-swing {
          transform-origin: top center;
          animation: swing 1s ease-in-out;
        }
      `}</style>
      
      <div className="group relative flex flex-col items-center mt-6">
        {/* The Bulb */}
        <button
          onClick={toggleTheme}
          className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
            isPulling ? "translate-y-1" : ""
          } ${isSwinging ? "animate-swing" : ""}`}
          aria-label="Toggle theme"
        >
          <div className={`text-[1.5rem] transition-colors duration-300 ${!isDark ? "text-amber drop-shadow-[0_0_8px_rgba(245,165,36,0.6)]" : "text-muted-foreground"}`}>
            <Lightbulb 
              toggled={!isDark}
              toggle={setIsDark}
              forceSelected={!isDark}
              className="pointer-events-none" 
            />
          </div>
        </button>

        {/* The Pull String */}
        <div 
          onClick={toggleTheme}
          className={`cursor-pointer flex flex-col items-center transition-all duration-300 ${
            isPulling ? "translate-y-3" : "translate-y-0"
          } ${isSwinging ? "animate-swing" : ""} -mt-0.5 group-hover:translate-y-1`}
          style={{ transformOrigin: "top center" }}
        >
          <div className="h-6 w-[1.5px] bg-muted-foreground/40" />
          <div className="size-2 rounded-full bg-muted-foreground shadow-sm" />
        </div>
      </div>
    </>
  );
}
