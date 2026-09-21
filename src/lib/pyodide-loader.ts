// Loads Pyodide once from the official CDN and caches the instance on `window`.
// Pyodide is heavy (~10MB), so we only load it on demand (client-only).

const PYODIDE_VERSION = "0.26.4";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pyodide = any;

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
    __pyodide?: Pyodide;
    __pyodideLoading?: Promise<Pyodide>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed: ${src}`)));
      // Already loaded scripts won't fire load again — resolve next tick.
      if ((existing as HTMLScriptElement).dataset.loaded === "1") resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function getPyodide(onProgress?: (msg: string) => void): Promise<Pyodide> {
  if (typeof window === "undefined") throw new Error("Pyodide is client-only");
  if (window.__pyodide) return window.__pyodide;
  if (window.__pyodideLoading) return window.__pyodideLoading;

  window.__pyodideLoading = (async () => {
    onProgress?.("Downloading Pyodide runtime…");
    await loadScript(`${CDN}/pyodide.js`);
    if (!window.loadPyodide) throw new Error("Pyodide global missing");
    onProgress?.("Booting CPython in WebAssembly…");
    const py = await window.loadPyodide({ indexURL: `${CDN}/` });
    window.__pyodide = py;
    onProgress?.("Ready.");
    return py;
  })();

  return window.__pyodideLoading;
}
