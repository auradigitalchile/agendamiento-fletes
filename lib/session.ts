import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getServerSession() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  return session
}

export async function getOrganizationId() {
  const session = await getServerSession()

  if (!session.user.organizationId) {
    throw new Error("Usuario no tiene organización asignada")
  }

  return session.user.organizationId
}
