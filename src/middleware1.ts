import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith("/admin")) return token?.role === "admin";
      return !!token;
    },
  },
});

export const config = { matcher: ["/admin:path*", "/profile"] };


// import { type NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "./lib/authOptions";
// import { getToken } from 'next-auth/jwt';

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // 보호된 라우트 확인 (예: /dashboard로 시작하는 모든 경로)
//   const isProtectedRoute = pathname.startsWith('/profile');

//   // 관리자 라우트 확인 (예: /admin으로 시작하는 모든 경로)
//   const isAdminRoute = pathname.startsWith('/admin');

//   // 공개 라우트는 미들웨어를 통과
//   if (!isProtectedRoute && !isAdminRoute) {
//     return NextResponse.next();
//   }

//   // Get session token using getToken
//   console.log('#### NEXTAUTH_SECRET : ', process.env.NEXTAUTH_SECRET)
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//   if (!token) {
//     // If there's no token (user not logged in), redirect to login page
//     console.log('#### there is no token')
//     return NextResponse.redirect(new URL('/api/auth/signin', request.url));
//   }
  
//   console.log('#### token : ', token)
//   if (isAdminRoute) {
//     // Check role for admin routes
//     const userRole = token.role as string; // Get user role from token
//     if (userRole !== 'Admin') {
//       // If not an admin, return unauthorized response
//       return new NextResponse('You are not authorized.', { status: 403 });
//     }
//   }

//   // // getServerSession을 사용하여 세션 정보 가져오기
//   // const session = await getServerSession(authOptions);
  

//   // if (!session) {
//   //   // 세션이 없으면 (로그인하지 않았으면) 로그인 페이지로 리다이렉트
//   //   return NextResponse.redirect(new URL('/api/auth/signin', request.url));
//   // }

//   // if (isAdminRoute) {
//   //   console.log('getServerSession session : ', session.user)
//   //   // 관리자 라우트인 경우 역할 확인
//   //   // const userRole = session?.user?.role as string;  // 세션에서 사용자 역할을 가져옵니다
//   //   const userRole = 'Admin';  // 세션에서 사용자 역할을 가져옵니다

//   //   if (userRole !== 'Admin') {
//   //     // 관리자가 아니면 권한 없음 응답
//   //     return new NextResponse('You are not authorized.', { status: 403 });
//   //   }
//   // }

//   // 모든 검증을 통과하면 다음으로 진행
//   return NextResponse.next();
// }
