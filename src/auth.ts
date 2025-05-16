import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
 
export const { handlers: {GET, POST}, signIn, signOut, auth } = NextAuth({
  session: {strategy: "jwt"},
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      authorize: async (credentials) => {
        if(!credentials || !credentials.username || !credentials.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        var user = await prisma.user.findUnique({
          where: {
            username: username
          }
        });

        if(!user) {
          return null;
        }
        else {
          if(!bcrypt.compareSync(password, user.password)) {
            return null;
          }
          if(!user.isEnabled) {
            return null;
          }
        }

        if(user) {
          return {
            ...user,
            id: user.id.toString(),
          };
        }

        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login"
  }
});