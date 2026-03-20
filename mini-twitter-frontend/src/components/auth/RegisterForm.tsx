import { useState } from "react";
import { Mail, Eye, EyeOff, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  registerSchema,
  type RegisterFormData,
} from "../../schemas/authSchema";
import { registerUser } from "../../services/auth";

type RegisterFormProps = {
  onSuccess: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setApiError("");
      onSuccess();
    },
    onError: (error) => {
      console.error("Erro ao cadastrar:", error);
      setApiError("Não foi possível realizar o cadastro.");
    },
  });

  function onSubmit(data: RegisterFormData) {
    setApiError("");
    registerMutation.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2 text-left">
          Olá, vamos começar!
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-left">
          Por favor, insira os dados solicitados para fazer cadastro.
        </p>
      </div>

      <div className="text-left">
        <label className="text-sm text-slate-600 dark:text-white">Nome</label>

        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Insira o seu nome"
            {...register("name")}
            className="w-full
            bg-white dark:bg-slate-800
            border border-slate-300 dark:border-slate-700
            rounded-lg py-3 pl-4 pr-10
            outline-none focus:border-blue-500
            text-black dark:text-white
            placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />

          <User
            className="absolute right-3 top-4 text-slate-500 dark:text-slate-400"
            size={18}
          />
        </div>

        {errors.name && (
          <p className="text-sm text-red-500 mt-2">{errors.name.message}</p>
        )}
      </div>

      <div className="text-left">
        <label className="text-sm text-slate-600 dark:text-white">E-mail</label>

        <div className="relative mt-2">
          <input
            type="email"
            placeholder="Insira o seu e-mail"
            {...register("email")}
            className="w-full
            bg-white dark:bg-slate-800
            border border-slate-300 dark:border-slate-700
            rounded-lg py-3 pl-4 pr-10
            outline-none focus:border-blue-500
            text-black dark:text-white
            placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />

          <Mail
            className="absolute right-3 top-4 text-slate-500 dark:text-slate-400"
            size={18}
          />
        </div>

        {errors.email && (
          <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>
        )}
      </div>

      <div className="text-left">
        <label className="text-sm text-slate-600 dark:text-white">Senha</label>

        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Insira a sua senha"
            {...register("password")}
            className="w-full
            bg-white dark:bg-slate-800
            border border-slate-300 dark:border-slate-700
            rounded-lg py-3 pl-4 pr-10
            outline-none focus:border-blue-500
            text-black dark:text-white
            placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />

          {showPassword ? (
            <EyeOff
              onClick={() => setShowPassword(false)}
              className="absolute right-3 top-4 text-slate-500 dark:text-slate-400 hover:cursor-pointer"
              size={18}
            />
          ) : (
            <Eye
              onClick={() => setShowPassword(true)}
              className="absolute right-3 top-4 text-slate-500 dark:text-slate-400 hover:cursor-pointer"
              size={18}
            />
          )}
        </div>

        {errors.password && (
          <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
        )}
      </div>

      {apiError && <p className="text-sm text-red-500 text-left">{apiError}</p>}

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full py-3 rounded-full bg-[#0D93F2] hover:opacity-90 transition font-bold text-white disabled:opacity-60"
      >
        {registerMutation.isPending ? "Cadastrando..." : "Continuar"}
      </button>

      <p className="text-xs text-center text-slate-600 dark:text-slate-400">
        Ao clicar em continuar, você concorda com nossos
        <span className="underline mx-1">Termos de Serviço</span>e
        <span className="underline ml-1">Política de Privacidade</span>.
      </p>
    </form>
  );
}
