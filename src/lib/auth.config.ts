import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Empty for Edge compatibility
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.currency = (user as any).currency;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).currency = token.currency;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
      const isPublicPage = pathname === "/";
      const isApiRoute = pathname.startsWith("/api");
      const isStaticRoute = pathname.startsWith("/_next") || pathname.startsWith("/favicon");

      if (isApiRoute || isStaticRoute) return true;

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && !isPublicPage) {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
