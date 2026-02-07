import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  let collections = [];
  
  if (collectionForDomain) {
    // If on a custom domain, only show that collection
    collections = [collectionForDomain];
  } else {
    // If on main domain, show all collections that don't have a custom domain
    // (or show all for now if no custom domain is set)
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

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar collections={collections} />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
