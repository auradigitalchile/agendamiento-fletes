import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Extender tipos de NextAuth para incluir organizationId
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string
      organizationSlug: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    organizationId?: string
    organizationSlug?: string
    role?: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    organizationId?: string
    organizationSlug?: string
    role?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            organizations: {
              include: {
                organization: true,
              },
              take: 1, // Por ahora tomamos la primera organización del usuario
            },
          },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        // Si el usuario tiene organizaciones, agregamos la info
        const userOrg = user.organizations[0]

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: userOrg?.organizationId,
          organizationSlug: userOrg?.organization?.slug,
          role: userOrg?.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.organizationId = user.organizationId
        token.organizationSlug = user.organizationSlug
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationSlug = token.organizationSlug as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
