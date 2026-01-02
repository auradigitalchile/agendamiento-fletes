"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Header } from "@/components/layout/header"
import { Lock, Mail, CreditCard, Plus, Pencil, Trash2, Tag } from "lucide-react"
import {
  getTransferAccounts,
  createTransferAccount,
  updateTransferAccount,
  deleteTransferAccount,
  TransferAccount,
} from "@/lib/api/transfer-accounts"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("password")
  const [session, setSession] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Change Email State
  const [newEmail, setNewEmail] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)

  // Transfer Accounts State
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<TransferAccount | null>(null)
  const [accountName, setAccountName] = useState("")

  // Categories State
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryType, setCategoryType] = useState<"INGRESO" | "GASTO">("INGRESO")

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data))
  }, [])

  // Query para obtener cuentas de transferencia
  const { data: transferAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["transfer-accounts"],
    queryFn: getTransferAccounts,
    enabled: activeTab === "transfer-accounts",
  })

  // Query para obtener categorías
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Error al obtener categorías")
      return res.json()
    },
    enabled: activeTab === "categories",
  })

  // Debug logging
  useEffect(() => {
    console.log("🔍 Settings Page - activeTab:", activeTab)
    console.log("📊 Settings Page - transferAccounts:", transferAccounts)
    console.log("⏳ Settings Page - accountsLoading:", accountsLoading)
  }, [activeTab, transferAccounts, accountsLoading])

  // Mutation para crear cuenta
  const createMutation = useMutation({
    mutationFn: createTransferAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfer-accounts"] })
      setShowAccountForm(false)
      setAccountName("")
      toast({
        title: "Cuenta creada",
        description: "La cuenta de transferencia ha sido creada exitosamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      })
    },
  })

  // Mutation para actualizar cuenta
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateTransferAccount(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfer-accounts"] })
      setEditingAccount(null)
      setAccountName("")
      toast({
        title: "Cuenta actualizada",
        description: "La cuenta de transferencia ha sido actualizada exitosamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la cuenta",
        variant: "destructive",
      })
    },
  })

  // Mutation para eliminar cuenta
  const deleteMutation = useMutation({
    mutationFn: deleteTransferAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfer-accounts"] })
      toast({
        title: "Cuenta eliminada",
        description: "La cuenta de transferencia ha sido eliminada exitosamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cuenta",
        variant: "destructive",
      })
    },
  })

  // Mutation para crear categoría
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al crear categoría")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-all"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setShowCategoryForm(false)
      setCategoryName("")
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la categoría",
        variant: "destructive",
      })
    },
  })

  // Mutation para eliminar categoría
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Error al eliminar categoría")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-all"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast({
        title: "Categoría desactivada",
        description: "La categoría ha sido desactivada exitosamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    },
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordMessage("")

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña")
      }

      setPasswordMessage("Contraseña actualizada exitosamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setPasswordError(error.message || "Error al cambiar la contraseña")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setEmailMessage("")

    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Ingresa un email válido")
      return
    }

    setEmailLoading(true)

    try {
      const response = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al solicitar cambio de email")
      }

      setEmailMessage("Se ha enviado un enlace de verificación a tu nuevo correo electrónico")
      setNewEmail("")
    } catch (error: any) {
      setEmailError(error.message || "Error al solicitar cambio de email")
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName.trim()) return

    await createMutation.mutateAsync({ name: accountName.trim() })
  }

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAccount || !accountName.trim()) return

    await updateMutation.mutateAsync({
      id: editingAccount.id,
      name: accountName.trim(),
    })
  }

  const handleEditAccount = (account: TransferAccount) => {
    setEditingAccount(account)
    setAccountName(account.name)
  }

  const handleCancelEdit = () => {
    setEditingAccount(null)
    setAccountName("")
  }

  const handleDeleteAccount = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cuenta de transferencia?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    await createCategoryMutation.mutateAsync({
      name: categoryName.trim(),
      type: categoryType,
    })
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas desactivar esta categoría?")) {
      await deleteCategoryMutation.mutateAsync(id)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Configuración de Cuenta" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("password")}
                className={`${
                  activeTab === "password"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Lock className="h-4 w-4" />
                Cambiar Contraseña
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`${
                  activeTab === "email"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Mail className="h-4 w-4" />
                Cambiar Email
              </button>
              <button
                onClick={() => setActiveTab("transfer-accounts")}
                className={`${
                  activeTab === "transfer-accounts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <CreditCard className="h-4 w-4" />
                Cuentas de Transferencia
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Tag className="h-4 w-4" />
                Categorías
              </button>
            </nav>
          </div>

          {/* Password Change Tab */}
          {activeTab === "password" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu contraseña actual"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                {passwordError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
              </form>
            </div>
          )}

          {/* Email Change Tab */}
          {activeTab === "email" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Cambiar Email</h2>
              <p className="text-sm text-gray-600 mb-4">
                Email actual: <span className="font-medium">{session?.user?.email}</span>
              </p>

              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo Email
                  </label>
                  <input
                    id="newEmail"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="nuevo@email.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Te enviaremos un enlace de verificación a tu nuevo correo electrónico
                  </p>
                </div>

                {emailError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                    {emailError}
                  </div>
                )}

                {emailMessage && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                    {emailMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailLoading ? "Enviando..." : "Enviar Verificación"}
                </button>
              </form>
            </div>
          )}

          {/* Transfer Accounts Tab */}
          {activeTab === "transfer-accounts" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Cuentas de Transferencia</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra las cuentas bancarias donde recibes transferencias
                  </p>
                </div>
                {!showAccountForm && !editingAccount && (
                  <button
                    onClick={() => setShowAccountForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Cuenta
                  </button>
                )}
              </div>

              {/* Formulario para crear cuenta */}
              {showAccountForm && (
                <form onSubmit={handleCreateAccount} className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Nueva Cuenta de Transferencia</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ej: Transfer. Leonardo"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createMutation.isPending ? "Creando..." : "Crear"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountForm(false)
                        setAccountName("")
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de cuentas */}
              {accountsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando cuentas...
                </div>
              ) : transferAccounts && transferAccounts.length > 0 ? (
                <div className="space-y-3">
                  {transferAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      {editingAccount?.id === account.id ? (
                        <form onSubmit={handleUpdateAccount} className="flex-1 flex gap-3">
                          <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {updateMutation.isPending ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{account.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Eliminar"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay cuentas de transferencia. Crea una para empezar.
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Categorías de Caja</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra las categorías para tus movimientos de caja
                  </p>
                </div>
                {!showCategoryForm && (
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                  </button>
                )}
              </div>

              {/* Formulario para crear categoría */}
              {showCategoryForm && (
                <form onSubmit={handleCreateCategory} className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Nueva Categoría</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <select
                        value={categoryType}
                        onChange={(e) => setCategoryType(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="INGRESO">Ingreso</option>
                        <option value="GASTO">Gasto</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Nombre de la categoría"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={createCategoryMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {createCategoryMutation.isPending ? "Creando..." : "Crear"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryForm(false)
                          setCategoryName("")
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Lista de categorías */}
              {categoriesLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando categorías...
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {/* Categorías de Ingresos */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                      Ingresos
                    </h3>
                    <div className="space-y-2">
                      {categories
                        .filter((cat: any) => cat.type === "INGRESO")
                        .map((cat: any) => (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Desactivar"
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      {categories.filter((cat: any) => cat.type === "INGRESO").length === 0 && (
                        <p className="text-sm text-gray-500 italic p-3">No hay categorías de ingresos</p>
                      )}
                    </div>
                  </div>

                  {/* Categorías de Gastos */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                      Gastos
                    </h3>
                    <div className="space-y-2">
                      {categories
                        .filter((cat: any) => cat.type === "GASTO")
                        .map((cat: any) => (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Desactivar"
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      {categories.filter((cat: any) => cat.type === "GASTO").length === 0 && (
                        <p className="text-sm text-gray-500 italic p-3">No hay categorías de gastos</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay categorías. Crea algunas para empezar.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
