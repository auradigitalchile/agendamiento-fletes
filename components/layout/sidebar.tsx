"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, Truck, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Calendario",
    icon: Calendar,
    href: "/",
    color: "text-blue-500",
  },
  {
    label: "Servicios",
    icon: Truck,
    href: "/services",
    color: "text-green-500",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clients",
    color: "text-purple-500",
  },
  {
    label: "Reportes",
    icon: FileText,
    href: "/reports",
    color: "text-orange-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Flete MVP</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === route.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <route.icon className={cn("h-5 w-5", pathname === route.href ? "" : route.color)} />
            {route.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>Flete MVP v1.0</p>
          <p>Sistema de gestión de fletes</p>
        </div>
      </div>
    </div>
  )
}
