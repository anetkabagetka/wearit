import { ArcElement, CategoryScale, Chart, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";

// Chart.js only loads these parts: lines with points, the donut (Arc),
// the month names and values (the two Scales) and the pop-up when you point at a value (Tooltip).
// Every chart component imports this file, so it runs once before the first chart
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip);
Chart.defaults.font.family = "Karla, sans-serif";

// The four chart grays (darkest first), and the colours of the guide lines and month names.
// Chart.js draws on a <canvas> element, which can't use CSS variables like var(--black), so they're written out here:
// the grays on a light page, the same grays the other way round in the dark theme
export function chartColors() {
    const isDark = document.documentElement.dataset.theme === "dark";
    return isDark
        ? { chart: ["#fff", "#a3a3a3", "#5c5c5c", "#292929"], grid: "#333", text: "#a3a3a3" }
        : { chart: ["#000", "#5c5c5c", "#a3a3a3", "#d6d6d6"], grid: "#e4e4e4", text: "#6e6e6e" };
}

// "1 wear" or "12 wears". Unlike formatWears, 0 is "0 wears", which reads better in a chart
export function wearsWord(count) {
    return `${count} ${count === 1 ? "wear" : "wears"}`;
}
