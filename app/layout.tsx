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
          <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar - Desktop only */}
            <aside className="hidden lg:block lg:w-56 flex-shrink-0">
              <Sidebar />
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile header with menu */}
              <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-gray-200 bg-white">
                <MobileMenu />
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h1 className="text-base font-semibold text-gray-900">Flete</h1>
                </div>
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
