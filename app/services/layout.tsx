import { MainLayout } from "@/components/layout/main-layout"

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
