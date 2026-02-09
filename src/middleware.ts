import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const hostname = req.headers.get("host") || "";
    const { nextUrl } = req;
    const url = req.nextUrl.clone();

    // 1. Identificar se é o domínio principal de Administração
    const isAdminDomain = hostname.startsWith("app.cloudstage.com.br") || 
                         hostname.startsWith("admin.cloudstage.com.br") ||
                         hostname.includes("localhost");

    // 2. Lógica de Resolução Multi-tenant (GitBook Style)
    // Se não for domínio de admin, resolvemos como site público
    if (!isAdminDomain) {
      // 2.1 Resolução por Subdomínio (ex: site1.cloudstage.com.br)
      const parts = hostname.split(".");
      if (parts.length >= 3 && parts[parts.length - 2] === "cloudstage" && parts[parts.length - 1] === "com" && parts[parts.length - 0] === "br") {
        // Isso é complexo por causa do .com.br, vamos simplificar:
      }

      // Versão simplificada: se não for app.* ou admin.*, mas terminar em .cloudstage.com.br
      if (hostname.endsWith(".cloudstage.com.br") && 
          !hostname.startsWith("app.") && 
          !hostname.startsWith("admin.")) {
        const siteSlug = hostname.split(".")[0];
        url.pathname = `/_sites/${siteSlug}${nextUrl.pathname}`;
        return NextResponse.rewrite(url);
      }

      // 2.2 Resolução por Domínio Customizado (ex: docs.empresa.com)
      if (!hostname.endsWith(".cloudstage.com.br") && !hostname.includes("localhost")) {
        // Aqui precisaríamos de uma busca no banco para saber qual site tem esse domain
        // Mas como middleware é edge, podemos usar uma rota de cache ou apenas reescrever para uma rota que trate isso
        url.pathname = `/_sites/_domain/${hostname}${nextUrl.pathname}`;
        return NextResponse.rewrite(url);
      }
      
      // 2.3 Resolução por Path (ex: app.cloudstage.com.br/docs/slug)
      if (nextUrl.pathname.startsWith("/docs")) {
        const segments = nextUrl.pathname.split("/").filter(Boolean);
        if (segments.length >= 2) {
          const siteSlug = segments[1];
          const remainingPath = segments.slice(2).join("/");
          
          // Reescreve internamente para a rota de renderização dinâmica
          // /docs/[siteSlug]/[...path]
          url.pathname = `/_sites/${siteSlug}/${remainingPath}`;
          return NextResponse.rewrite(url);
        }
      }

      // Se for um domínio customizado (docs.empresa.com)
      // url.pathname = `/_sites/_domain/${hostname}${nextUrl.pathname}`;
      // return NextResponse.rewrite(url);
    }

    // 3. Proteção de Rotas Admin
    if (nextUrl.pathname.startsWith("/admin") && !isAdminDomain) {
       return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
