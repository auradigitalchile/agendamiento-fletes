import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Rutas públicas
  const publicRoutes = ["/login", "/register", "/forgot-password"]
  const isPublicRoute = publicRoutes.includes(pathname) ||
                         pathname.startsWith("/reset-password") ||
                         pathname.startsWith("/verify-email")

  // Si no está logueado y no está en ruta pública, redirigir a login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  // Si está logueado y está en login/register, redirigir a caja
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/caja", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
