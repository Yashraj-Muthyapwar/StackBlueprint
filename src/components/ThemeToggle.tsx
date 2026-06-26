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
          0% { transform: rotate(0deg); animation-timing-function: ease-out; }
          15% { transform: rotate(25deg); animation-timing-function: ease-in-out; }
          35% { transform: rotate(-20deg); animation-timing-function: ease-in-out; }
          55% { transform: rotate(12deg); animation-timing-function: ease-in-out; }
          75% { transform: rotate(-6deg); animation-timing-function: ease-in-out; }
          90% { transform: rotate(2deg); animation-timing-function: ease-in-out; }
          100% { transform: rotate(0deg); }
        }
        .animate-swing {
          transform-origin: top center;
          animation: swing 1.2s both;
        }
      `}</style>
      
      <div className="group relative flex flex-col items-center">
        {/* The Bulb (Steady) */}
        <button
          onClick={toggleTheme}
          className="relative z-10 flex items-center justify-center"
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

        {/* The Pull String (Animated) */}
        <div 
          onClick={toggleTheme}
          className={`cursor-pointer absolute top-full flex flex-col items-center transition-transform duration-150 ${
            isPulling ? "translate-y-3" : "translate-y-0"
          } group-hover:translate-y-1`}
        >
          <div 
            className={`flex flex-col items-center ${isSwinging ? "animate-swing" : ""}`}
            style={{ transformOrigin: "top center" }}
          >
            <div className="h-6 w-[1.5px] bg-muted-foreground/60" />
            <div className="size-2 rounded-full bg-muted-foreground shadow-sm" />
          </div>
        </div>
      </div>
    </>
  );
}
