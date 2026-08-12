import logoImg from "@/images/logos/logo.png";
import { Shield, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-hairline bg-surface/20 px-6 py-4 backdrop-blur-2xl transition-all duration-500 lg:px-12">
      {/* Contained background effects to prevent page overflow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[1px] w-1/2 -translate-x-1/2 animate-pulse bg-gradient-to-r from-transparent via-mint/50 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[120px] w-3/4 -translate-x-1/2 rounded-full bg-mint/5 blur-[60px]" />
      </div>
      
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row sm:gap-0">
        
        {/* Left side: Brand lockup */}
        <div className="group flex cursor-pointer items-center gap-4">
          <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-mint/20 via-mint/5 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-mint/20 transition-all duration-500 group-hover:scale-110 group-hover:ring-mint/50 group-hover:shadow-[0_0_30px_-5px_rgba(94,234,212,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-mint/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <img src={logoImg} alt="StackBlueprint Logo" className="relative z-10 size-5 object-contain transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-sm font-bold tracking-tight text-transparent transition-all duration-300 group-hover:to-mint/80">
              StackBlueprint
            </span>
            <span className="text-xs font-medium text-muted-foreground/60 transition-colors duration-300 group-hover:text-muted-foreground/90">
              © {new Date().getFullYear()}. All rights reserved.
            </span>
          </div>
        </div>

        {/* Right side: Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="/privacy" className="group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-mint/10 hover:text-mint">
            <Shield className="size-3.5 opacity-50 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" />
            Privacy Policy
          </a>
          <a href="/terms" className="group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-mint/10 hover:text-mint">
            <FileText className="size-3.5 opacity-50 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" />
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
