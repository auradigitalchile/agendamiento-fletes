import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar, MobileMenu } from "@/components/layout/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Flete MVP - Sistema de Gestión",
  description: "Sistema de gestión de fletes, mudanzas y retiro de escombros",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Desktop only */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <Sidebar />
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
              {/* Mobile header with menu */}
              <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b bg-card">
                <MobileMenu />
                <h1 className="text-lg font-bold">Flete MVP</h1>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
