import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import UsosProvider from '@/providers/usos'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'

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
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
    })
  ],

  session: {
    maxAge: 2 * 60 * 60
  },

  callbacks: {
    session({ session, user }) {
      if(session.user) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.usosId = user.usosId
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    // signOut: "/auth/logout",
    // error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    // newUser: "/auth/signup",
  },
} satisfies NextAuthOptions

export async function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return await getServerSession(...args, authOptions)
}
