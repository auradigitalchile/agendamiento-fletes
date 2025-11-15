import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Rutas públicas
  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Si no está logueado y no está en ruta pública, redirigir a login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  // Si está logueado y está en login/register, redirigir a home
  if (isLoggedIn && isPublicRoute) {
    const homeUrl = new URL("/", req.nextUrl.origin)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
