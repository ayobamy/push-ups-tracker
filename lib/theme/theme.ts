export const THEME_KEY = "theme";

export type Theme = "light" | "dark";

export function parseTheme(raw: string | null | undefined): Theme | null {
  if (raw === "light" || raw === "dark") {
    return raw;
  }
  return null;
}

export function resolveTheme(
  stored: Theme | null,
  prefersDark: boolean,
): Theme {
  if (stored) {
    return stored;
  }
  return prefersDark ? "dark" : "light";
}

export function paintTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

const listeners = new Set<() => void>();

function emitTheme() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_KEY) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function readStoredTheme(): Theme {
  const stored = parseTheme(localStorage.getItem(THEME_KEY));
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveTheme(stored, prefersDark);
}

export function applyTheme(theme: Theme): void {
  paintTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // private mode
  }
  emitTheme();
}

export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.classList.toggle("light",!d);e.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
