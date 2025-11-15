"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, Truck, FileText, Menu, X, Wallet, DollarSign, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
    label: "Caja",
    icon: Wallet,
    href: "/caja",
    color: "text-emerald-500",
  },
  {
    label: "Cierre Diario",
    icon: DollarSign,
    href: "/caja/cierre",
    color: "text-yellow-500",
  },
  {
    label: "Dashboard Finanzas",
    icon: BarChart3,
    href: "/caja/dashboard",
    color: "text-indigo-500",
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
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-tight">Flete</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 pt-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              pathname === route.href
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 space-y-0.5">
          <p className="font-medium text-gray-700">Flete MVP</p>
          <p>Versión 1.0.0</p>
        </div>
      </div>
    </>
  )
}

// Sidebar for desktop
export function Sidebar() {
  return (
    <div className="hidden lg:flex h-full flex-col bg-white border-r border-gray-200">
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
