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
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070" 
          alt="Mountain Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>

      <div className="w-full max-w-[320px] space-y-6 z-10 relative">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl mb-4 shadow-2xl">
            <Cloud className="w-12 h-12 text-green-500 fill-green-500/10" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">cloudstage</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Painel Administrativo</p>
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
