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
  let collections = [];
  
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    // Check if we are on a custom domain
    const collectionForDomain = await prisma.collection.findUnique({
      where: { customDomain: host },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (collectionForDomain) {
      // If on a custom domain, only show that collection
      collections = [collectionForDomain];
    } else {
      // If on main domain, show all collections that don't have a custom domain
      collections = await prisma.collection.findMany({
        where: {
          OR: [
            { customDomain: null },
            { customDomain: "" }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    }
  } catch (error) {
    console.error("Erro ao carregar coleções:", error);
    // collections remains empty array
  }

  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar collections={collections} />
            <div className="flex flex-1">
              {session && <AdminSidebar collections={collections} />}
              <main className="flex-1 overflow-y-auto no-scrollbar">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
