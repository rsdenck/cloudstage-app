import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminSidebarData } from "@/lib/admin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cloudstage - Documentação Moderna",
  description: "Gerencie e publique sua documentação de forma profissional com cloudstage.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  // Identificar se é o domínio de administração
  const isAdminDomain = host.startsWith("app.cloudstage.com.br") || 
                       host.startsWith("admin.cloudstage.com.br") ||
                       host.includes("localhost");

  let sidebarData: any[] = [];
  let navbarCollections: any[] = [];

  if (session && isAdminDomain) {
    sidebarData = await getAdminSidebarData();
  }

  // Lógica Simplificada para o Navbar (usada para navegação rápida entre sites/coleções)
  try {
    navbarCollections = await prisma.collection.findMany({
      take: 5,
      select: { id: true, name: true, slug: true },
      orderBy: { updatedAt: "desc" }
    });
  } catch (e) {}

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar collections={navbarCollections} />
            <div className="flex flex-1 overflow-hidden">
              {session && isAdminDomain && <AdminSidebar sites={sidebarData} />}
              <main className="flex-1 overflow-y-auto no-scrollbar relative">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
