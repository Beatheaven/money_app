import { edgeMiddleware } from "@/lib/auth-edge";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  return edgeMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
