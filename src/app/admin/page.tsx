import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, MousePointer2 } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-black">
      <div className="max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
          <div className="relative p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl shadow-2xl">
            <BookOpen className="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bem-vindo ao cloudstage
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Selecione uma coleção ou documento na barra lateral para começar a editar sua documentação.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-600 uppercase tracking-widest pt-4">
          <MousePointer2 className="w-3.5 h-3.5 animate-bounce" />
          <span>Use a barra lateral para navegar</span>
        </div>
      </div>
    </div>
  );
}
