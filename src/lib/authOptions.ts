import { Account, NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from '@prisma/client'
import prisma from "./prisma";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

// Prisma의 User 타입을 확장하여 accounts를 포함하는 타입 정의
type UserWithAccounts = Prisma.UserGetPayload<{
  include: { accounts: true }
}>;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error('Missing GitHub OAuth credentials');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        console.log('google profile', profile);
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? "user",
          provider: 'google',
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        console.log('github profile', profile);
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: profile.role ?? "user",
          provider: 'github',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }): Promise<boolean> {
      // console.log('### signin callback, user : ', user);
      // console.log('### signin callback, account : ', account);
      // console.log('### signin callback, profile : ', profile);
      try {
        if (account?.type === 'oauth') {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile?.email },
            include: { accounts: true },
          });

          if (existingUser) {
            console.log('### signin callback, existingUser : ', existingUser);
            const linkedAccount = existingUser.accounts.find(
              (acc) => acc.provider === account.provider
            );

            if (!linkedAccount) {
              // 현재 로그인 중인 제공자의 계정이 연결되어 있지 않은 경우
              await prisma.account.create({
                data: {
                  userId: existingUser.id,  // 여기서 User와 Account를 연결합니다
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }
          }
        }

        return true;

      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.provider = token.provider as string;
        try {
          const userWithAccounts = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: { accounts: true },
          }) as UserWithAccounts | null;;
          console.log('## session.user.accounts: ' + userWithAccounts)
          session.user.connectedProviders = userWithAccounts?.accounts.map(
            (account) => account.provider
          ) ?? [];
        } catch (error) {
          console.error('Error fetching user accounts:', error);
        }
      }
      return session;
    },

    async jwt({ token, user, account, trigger }: {
      token: JWT;
      user?: User | AdapterUser;
      account?: Account | null;
      trigger?: "signIn" | "signUp" | "update"
    }) {
      // 초기 로그인 또는 회원가입 시
      if (trigger === "signIn" || trigger === "signUp") {
        console.log("Initial sign in or sign up")
        return {
          ...token,
          accessToken: account?.access_token,
          refreshToken: account?.refresh_token,
          userId: user?.id,
          role: user?.role,
          provider: user?.provider,
        }
      }

      // 페이지 새로고침 또는 후속 요청 시
      console.log("Page refresh or subsequent request")

      // 토큰 만료 체크 및 갱신 로직
      if (token.accessTokenExpires && Date.now() >= (token.accessTokenExpires as number)) {
        console.log("Token expired, attempting to refresh")
        return refreshAccessToken(token)
      }

      return token
    },

  },
}


interface CustomJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  accessTokenExpires?: number;
}

// refreshAccessToken 함수의 타입도 업데이트합니다
async function refreshAccessToken(token: CustomJWT): Promise<CustomJWT> {
  try {
    // 토큰 갱신 로직 구현
    return {
      ...token,
      accessToken: "new_access_token",
      accessTokenExpires: Date.now() + 3600 * 1000,
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}