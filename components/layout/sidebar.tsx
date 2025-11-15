"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, Truck, FileText, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/dialog"

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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
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
            onClick={onNavigate}
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
    </>
  )
}

// Sidebar for desktop
export function Sidebar() {
  return (
    <div className="hidden lg:flex h-full flex-col bg-card border-r">
      <SidebarContent />
    </div>
  )
}

// Mobile menu button and drawer
export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-10 w-10"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-72 bg-card shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Truck className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">Flete MVP</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-10 w-10"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
