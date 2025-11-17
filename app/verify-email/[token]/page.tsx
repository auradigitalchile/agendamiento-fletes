"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    verifyEmail()
  }, [])

  const verifyEmail = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Email verificado exitosamente. Redirigiendo...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setStatus("error")
        setMessage(data.error || "Error al verificar el email")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error al procesar la verificación")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verificando email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verificado</h2>
              <p className="mt-2 text-green-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Error de Verificación</h2>
              <p className="mt-2 text-red-600">{message}</p>
              <a
                href="/settings"
                className="mt-6 inline-block text-blue-600 hover:text-blue-500"
              >
                Volver a configuración
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
