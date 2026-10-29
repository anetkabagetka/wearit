// Light or dark: puts data-theme="light" or data-theme="dark" on the <html> tag,
// and main.css picks the colours from that (see :root[data-theme="dark"])

// Tells us whether the phone or computer itself is set to dark mode
const systemDarkMode = window.matchMedia("(prefers-color-scheme: dark)");

// The last choice, so "Match system" can follow along when the system setting changes
let currentTheme = "light";

// theme is "light", "dark" or "system" (Match system). Nothing saved yet means light
export function applyTheme(theme = "light") {
  currentTheme = theme;
  const isDark = theme === "dark" || (theme === "system" && systemDarkMode.matches);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";

  // Also remembered on this device, so the next visit starts in the right colours
  // before the profile has loaded (see main.js)
  localStorage.setItem("theme", theme);
}

// The theme used last time on this device
export function savedTheme() {
  return localStorage.getItem("theme") ?? "light";
}

// The phone or computer switched between light and dark (some do it at sunset)
systemDarkMode.addEventListener("change", () => applyTheme(currentTheme));