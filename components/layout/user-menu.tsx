"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch session on client side
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  if (loading || !session?.user) {
    return null
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-900 truncate w-full">
            {session.user.name}
          </span>
          <span className="text-xs text-gray-500 truncate w-full">
            {session.user.email}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown - positioned above the button */}
          <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
