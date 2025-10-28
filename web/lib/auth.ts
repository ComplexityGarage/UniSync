import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import UsosProvider from '@/providers/usos'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { z } from 'zod'

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    UsosProvider({
      clientId: process.env.USOS_CLIENT_ID || '',
      clientSecret: process.env.USOS_CLIENT_SECRET || ''
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email }
          })
          if (!user || !user.password) return null

          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) return null

          return { id: user.id, email: user.email, name: user.name }
        }

        return null
      }
    })
  ],

  session: { strategy: 'jwt', maxAge: 2 * 60 * 60 },

  callbacks: {
    session({ session, token }: { session: any; token: any }) {
      session.user.id = token.sub
      return session
    }
  },

  pages: {
    signIn: '/auth/login'
  }
} satisfies NextAuthOptions

export async function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return await getServerSession(...args, authOptions)
}
