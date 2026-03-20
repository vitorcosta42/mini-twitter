import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Timeline from "./pages/Timeline";
import { useThemeStore } from "./stores/theme";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gradient-to-b dark:from-[#0F172B] dark:to-[#070B14] text-black dark:text-white">
      {isLoginPage && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </div>
  );
}
