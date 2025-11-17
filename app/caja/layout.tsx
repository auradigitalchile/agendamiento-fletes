import { MainLayout } from "@/components/layout/main-layout"

export default function CajaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
