import NextAuth from "next-auth";
import { User } from "@prisma/client";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      // ...other properties
    } & DefaultSession["user"]
  }

  interface User {
    // ...other properties
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User
  }
}

// declare module "next-auth/jwt" {
//   type JWT = User;
// }