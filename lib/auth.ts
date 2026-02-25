import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      // Block anyone who isn't the designated admin
      return user.email === process.env.ADMIN_EMAIL
    },
    session({ session }) {
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
