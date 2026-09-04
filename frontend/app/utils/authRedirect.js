export function getDefaultRouteForRole(role) {
    if (role === 'ADMIN')
        return '/admin/dashboard';
    if (role === 'ENTERPRISE')
        return '/enterprise';
    return '/';
}
export function getLoginRedirectForRole(role, requestedRedirect) {
    if (role === 'ADMIN') {
        return requestedRedirect?.startsWith('/admin') ? requestedRedirect : '/admin/dashboard';
    }
    if (role === 'ENTERPRISE') {
        return requestedRedirect?.startsWith('/enterprise') ? requestedRedirect : '/enterprise';
    }
    return requestedRedirect || '/';
}
