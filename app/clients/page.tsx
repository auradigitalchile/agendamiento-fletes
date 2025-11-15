"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Phone, Mail, MapPin, Pencil, Trash2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClientForm } from "@/components/clients/client-form"
import { useToast } from "@/components/ui/use-toast"
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  Client,
  CreateClientDTO,
} from "@/lib/api/clients"

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => getClients(search),
  })

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setIsFormOpen(false)
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado exitosamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateClientDTO }) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setIsFormOpen(false)
      setSelectedClient(undefined)
      toast({
        title: "Cliente actualizado",
        description: "El cliente ha sido actualizado exitosamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (data: CreateClientDTO) => {
    if (selectedClient) {
      await updateMutation.mutateAsync({ id: selectedClient.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsFormOpen(true)
  }

  const handleDelete = async (client: Client) => {
    if (confirm(`¿Estás seguro de eliminar al cliente "${client.name}"?`)) {
      await deleteMutation.mutateAsync(client.id)
    }
  }

  const handleNewClient = () => {
    setSelectedClient(undefined)
    setIsFormOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Clientes"
        description="Administra los clientes de tu negocio"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleNewClient}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando clientes...
          </div>
        ) : clients && clients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>
                        {client._count && client._count.services > 0 ? (
                          <Badge variant="secondary" className="mt-1">
                            {client._count.services} servicio{client._count.services !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-xs">Sin servicios</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.defaultAddress && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{client.defaultAddress}</span>
                    </div>
                  )}
                  {client.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
                      {client.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {search
                  ? "No se encontraron clientes con ese criterio"
                  : "No hay clientes registrados. Crea tu primer cliente."}
              </p>
              {!search && (
                <Button onClick={handleNewClient} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ClientForm
        client={selectedClient}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
