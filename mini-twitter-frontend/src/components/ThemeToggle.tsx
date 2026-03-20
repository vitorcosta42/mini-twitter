import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../stores/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-gray-300 
      dark:border-none
      dark:bg-gray-800 hover:bg-gray-100 
          dark:hover:bg-gray-600 transition"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
