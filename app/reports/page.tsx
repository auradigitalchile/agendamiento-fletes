"use client"

import { useState } from "react"
import { FileDown } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { exportServices } from "@/lib/api/services"

export default function ReportsPage() {
  const [month, setMonth] = useState("")
  const { toast } = useToast()

  const handleExport = async () => {
    if (!month) {
      toast({
        title: "Error",
        description: "Selecciona un mes para exportar",
        variant: "destructive",
      })
      return
    }

    try {
      await exportServices(month)
      toast({
        title: "Exportación exitosa",
        description: `Servicios del mes ${month} exportados`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar los servicios",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Reportes"
        description="Exporta y analiza tus servicios"
      />

      <div className="flex-1 space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Servicios a CSV</CardTitle>
            <CardDescription>
              Descarga un archivo CSV con todos los servicios de un mes específico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Selecciona el mes</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <Button onClick={handleExport} disabled={!month}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximamente</CardTitle>
            <CardDescription>
              Más reportes y análisis estarán disponibles en futuras versiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Gráficos de ingresos por mes</li>
              <li>Estadísticas de servicios por tipo</li>
              <li>Top clientes</li>
              <li>Análisis de rentabilidad</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
