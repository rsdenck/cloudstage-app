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
      // O hostname será usado para buscar o 'Site' no banco
      // Ex: docs.cliente.com -> Site.domain == 'docs.cliente.com'
      // app.cloudstage.com.br/docs/slug -> Site.slug == 'slug'
      
      // Se estiver no path /docs, tratamos como resolução por slug de site
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
