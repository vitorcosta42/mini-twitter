import { useSearchParams } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab: "login" | "register" =
    searchParams.get("tab") === "register" ? "register" : "login";

  return (
    <div
      className="min-h-screen flex items-center justify-center
      bg-white-bg
      dark:bg-gradient-to-b dark:from-[#0F172B] dark:to-[#070B14]
      text-[#0D93F2] dark:text-white px-6"
    >
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary dark:text-white">
          Mini Twitter
        </h1>

        <div className="flex border-b border-slate-300 dark:border-slate-700 mb-8">
          <button
            onClick={() => setSearchParams({ tab: "login" })}
            className={`flex-1 pb-3 text-center font-bold ${
              tab === "login"
                ? "border-b-2 border-blue-500 text-[#0D93F2] dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setSearchParams({ tab: "register" })}
            className={`flex-1 pb-3 text-center font-bold ${
              tab === "register"
                ? "border-b-2 border-blue-500 text-[#0D93F2] dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Cadastrar
          </button>
        </div>

        {tab === "login" ? (
          <LoginForm />
        ) : (
          <RegisterForm onSuccess={() => setSearchParams({ tab: "login" })} />
        )}
      </div>
    </div>
  );
}
