import { MainLayout } from "@/components/layout/main-layout"

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
