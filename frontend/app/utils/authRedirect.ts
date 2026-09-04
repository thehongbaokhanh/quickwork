type AuthRole = 'STUDENT' | 'ENTERPRISE' | 'ADMIN' | string | null | undefined

export function getDefaultRouteForRole(role: AuthRole) {
  if (role === 'ADMIN') return '/admin/dashboard'
  if (role === 'ENTERPRISE') return '/enterprise'
  return '/'
}

export function getLoginRedirectForRole(role: AuthRole, requestedRedirect?: string) {
  if (role === 'ADMIN') {
    return requestedRedirect?.startsWith('/admin') ? requestedRedirect : '/admin/dashboard'
  }

  if (role === 'ENTERPRISE') {
    return requestedRedirect?.startsWith('/enterprise') ? requestedRedirect : '/enterprise'
  }

  return requestedRedirect || '/'
}
