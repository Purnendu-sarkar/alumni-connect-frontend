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

function getRoleDetailPath(
  role: string,
  resource: 'jobs' | 'events' | 'announcements' | 'stories',
  idOrSlug: string,
): string {
  const normalizedRole = role.toUpperCase();
  const prefix =
    normalizedRole === 'SUPER_ADMIN'
      ? '/admin'
      : normalizedRole === 'MODERATOR'
        ? '/moderator'
        : normalizedRole === 'ALUMNI'
          ? '/alumni'
          : '/student';

  if (resource === 'stories') {
    if (normalizedRole === 'MODERATOR') {
      return `/moderator/content/${idOrSlug}`;
    }
    return `${prefix}/stories/${idOrSlug}`;
  }

  return `${prefix}/${resource}/${idOrSlug}`;
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

    // Role-based authorization gates: strict isolation per SSOT
    if (isAdminRoute && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }

    if (isModeratorRoute && userRole !== 'MODERATOR') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }

    if (isStudentRoute && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }

    if (isAlumniRoute && userRole !== 'ALUMNI') {
      return NextResponse.redirect(new URL(getRoleHome(userRole || 'STUDENT'), request.url));
    }
  }

  // 4. Guest-only routes: /login, /register, /forgot-password, /reset-password, /verify-email
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';
  if (isAuthRoute && isAuthenticated && userRole) {
    return NextResponse.redirect(new URL(getRoleHome(userRole), request.url));
  }

  // 5. Public detail routes auth-gate & role-aware workspace redirect:
  // /jobs/:slug, /events/:id, /announcements/:id, /stories/:id
  const detailMatch = pathname.match(/^\/(jobs|events|announcements|stories)\/(.+)$/);
  if (detailMatch) {
    const resource = detailMatch[1] as 'jobs' | 'events' | 'announcements' | 'stories';
    const idOrSlug = detailMatch[2];

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const targetDetailPath = getRoleDetailPath(userRole || 'STUDENT', resource, idOrSlug);
    return NextResponse.redirect(new URL(targetDetailPath, request.url));
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
    '/jobs/:path+',
    '/events/:path+',
    '/announcements/:path+',
    '/stories/:path+',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ],
};
