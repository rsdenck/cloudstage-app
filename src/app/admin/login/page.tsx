"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Cloud, Loader2, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciais inválidas. Tente novamente.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-[320px] space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-900 to-black rounded-lg mb-4 shadow-2xl shadow-green-500/10">
            <Cloud className="w-5 h-5 text-green-500" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-2 rounded text-[11px] border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/5 rounded focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-[12px] text-white placeholder:text-zinc-700"
              placeholder="E-mail"
            />
          </div>
          <div className="space-y-1">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/5 rounded focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-[12px] text-white placeholder:text-zinc-700"
              placeholder="Senha"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-900 to-black text-white py-2 rounded text-[12px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-lg shadow-green-900/10 border border-green-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Acessar"
            )}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
            Público
          </Link>
        </div>
      </div>
    </div>
  );
}
