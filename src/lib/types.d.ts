import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { User as DefaultUser } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role?: string;
      provider?: string;
      connectedProviders?: string[];
      // ...other properties
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    // ...other properties
    role?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
    provider?: string;
  }
}
