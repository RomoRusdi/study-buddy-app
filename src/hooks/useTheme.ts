import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

// Mendukung semua string id tema warna yang ada di Settings
export type ColorTheme = "default" | "ocean" | "forest" | "sunset" | "berry" | "midnight" | string;

export function useTheme() {
  // 1. State untuk Tema Warna (Color Theme)
  const [theme, setTheme] = useLocalStorage<ColorTheme>("ui-color-theme", "default");
  
  // 2. State untuk Dark Mode (Terang / Gelap)
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("ui-dark-mode", false);

  useEffect(() => {
    const root = window.document.documentElement;

    // --- MENGATUR DARK/LIGHT MODE ---
    if (darkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // --- MENGATUR COLOR THEME ---
    // Daftar class warna yang mungkin ada
    const themeClasses = [
      "theme-default", 
      "theme-ocean", 
      "theme-forest", 
      "theme-sunset", 
      "theme-berry", 
      "theme-midnight"
    ];
    
    // Hapus warna lama sebelum memasang yang baru
    root.classList.remove(...themeClasses);
    
    // Pasang class warna yang dipilih user (jika bukan default)
    if (theme && theme !== "default") {
      root.classList.add(`theme-${theme}`);
    }

  }, [darkMode, theme]); // Jalankan ulang jika darkMode atau theme diubah

  return { 
    theme, 
    setTheme, 
    darkMode, 
    setDarkMode 
  };
}