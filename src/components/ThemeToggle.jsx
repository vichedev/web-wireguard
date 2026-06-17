import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ theme, toggleTheme }) => {
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label="Cambiar tema"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors
        border-slate-200 bg-white text-slate-600 hover:bg-slate-100
        dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      <span className="text-xs font-semibold">
        {isDark ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
};

export default ThemeToggle;
