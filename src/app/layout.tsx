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
  
  // Identificar os diferentes tipos de domínio de forma exclusiva
  const isLocalhost = host.includes("localhost");
  
  // Admin: app.domain.com ou admin.domain.com ou app.localhost:3000
  const isAdminDomain = host.startsWith("app.") || 
                       host.startsWith("admin.") ||
                       (isLocalhost && host.startsWith("app."));

  // Tenant: docs.domain.com ou domínios customizados ou docs.localhost:3000
  const isTenantDomain = host.startsWith("docs.") || 
                        (isLocalhost && host.startsWith("docs.")) ||
                        (!host.startsWith("app.") && !host.startsWith("admin.") && !host.startsWith("www.") && host !== "cloudstage.com.br" && host !== "localhost:3000");

  // Main: cloudstage.com.br ou localhost:3000 (sem ser app. ou docs.)
  const isMainDomain = !isAdminDomain && !isTenantDomain;


  let sidebarData: any[] = [];
  let navbarCollections: any[] = [];

  if (session && isAdminDomain) {
    sidebarData = await getAdminSidebarData();
  }

  // Navbar para o site principal (Landing Page) ou Sites de Clientes (Tenant)
  if (isMainDomain || isTenantDomain) {
    try {
      if (isMainDomain) {
        navbarCollections = await prisma.collection.findMany({
          take: 5,
          select: { id: true, name: true, slug: true },
          orderBy: { updatedAt: "desc" }
        });
      } else {
        // Para domínios de tenant, buscamos as coleções do site específico
        // host pode ser docs.cloudstage.com.br ou um domínio customizado
        const siteSlug = host.split(".")[0];
        const site = await prisma.site.findFirst({
          where: {
            OR: [
              { slug: siteSlug },
              { domain: host }
            ]
          },
          include: {
            collections: {
              select: { id: true, name: true, slug: true },
              orderBy: { name: "asc" }
            }
          }
        });
        if (site) {
          navbarCollections = site.collections;
        }
      }
    } catch (e) {
      console.error("Erro ao buscar coleções para navbar:", e);
    }
  }

  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            {(isMainDomain || isTenantDomain) && <Navbar collections={navbarCollections} />}
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
