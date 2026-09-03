import { useCallback, useEffect, useState } from "react";

/**
 * Small hook that keeps a piece of state in the browser's localStorage.
 * Nothing is sent to a server, and reading happens after hydration so that
 * server rendering and the browser render the same first output.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore malformed storage */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage may be full or blocked */
    }
  }, [key, value, loaded]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, setValue, loaded, reset };
}

export const STORAGE_KEYS = {
  settings: "workflow-ai:settings",
  tasks: "workflow-ai:tasks",
  chat: "workflow-ai:chat",
} as const;

export type AppSettings = {
  defaultTone: "Professional" | "Formal" | "Friendly" | "Persuasive" | "Apologetic";
  defaultDetail: "Quick overview" | "Detailed" | "Executive summary";
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTone: "Professional",
  defaultDetail: "Quick overview",
};

export function useSettings() {
  return useLocalStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}
