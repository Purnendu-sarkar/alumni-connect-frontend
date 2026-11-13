import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRoleHome(role: string): string {
  switch (role) {
    case 'STUDENT':
      return '/student/dashboard';
    case 'ALUMNI':
      return '/alumni/dashboard';
    case 'MODERATOR':
      return '/moderator/dashboard';
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    default:
      return '/student/dashboard';
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const roleCookie = request.cookies.get('ac_role')?.value;
  const authCookie = request.cookies.get('ac_auth')?.value;
  const refreshCookie = request.cookies.get('refreshToken')?.value;

  const isAuthenticated = Boolean(authCookie || roleCookie || refreshCookie);
  const userRole = roleCookie?.toUpperCase();

  // 1. Dashboard entry redirect: /dashboard or /dashboard/*
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
  }

  // 2. Admin root redirect: /admin
  if (pathname === '/admin') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', '/admin/dashboard');
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 3. Protected route boundaries: /student/*, /alumni/*, /moderator/*, /admin/*
  const isStudentRoute = pathname.startsWith('/student');
  const isAlumniRoute = pathname.startsWith('/alumni');
  const isModeratorRoute = pathname.startsWith('/moderator');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isStudentRoute || isAlumniRoute || isModeratorRoute || isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization gates
    if (isAdminRoute && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }

    if (isModeratorRoute && userRole !== 'MODERATOR' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }

    if (isStudentRoute && userRole !== 'STUDENT' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }

    if (isAlumniRoute && userRole !== 'ALUMNI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }
  }

  // 4. Guest-only routes: /login, /register
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  if (isAuthRoute && isAuthenticated && userRole) {
    return NextResponse.redirect(new URL(getRoleHome(userRole), request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/student/:path*',
    '/alumni/:path*',
    '/moderator/:path*',
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
