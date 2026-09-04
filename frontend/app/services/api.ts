type ApiOptions = {
  params?: Record<string, any>
  query?: Record<string, any>
  headers?: HeadersInit
  credentials?: RequestCredentials
  auth?: boolean
  [key: string]: any
}

type ApiMethod = NonNullable<NonNullable<Parameters<typeof $fetch>[1]>['method']>

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function normalizeServerApiBase(value: unknown) {
  const raw = String(value || '').trim().replace(/\/+$/, '')
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`
  return /\/api\/v1$/i.test(withScheme) ? withScheme : `${withScheme}/api/v1`
}

function buildHeaders(headers?: HeadersInit, _includeAuth = true, hasJSONBody = false) {
  const requestHeaders = new Headers(headers)

  if (hasJSONBody && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  return requestHeaders
}

async function request<T = any>(
  method: ApiMethod,
  url: string,
  body?: any,
  options: ApiOptions = {},
) {
  const config = useRuntimeConfig()
  const { params, query, headers, auth = true, ...fetchOptions } = options
  const baseURL = import.meta.server
    ? normalizeServerApiBase(config.apiBaseInternal)
    : config.public.apiBase

  const reqHeaders = buildHeaders(headers, auth, body !== undefined && !(body instanceof FormData))
  if (body instanceof FormData) {
    reqHeaders.delete('Content-Type')
  }

  return await $fetch<T>(url, {
    baseURL: isAbsoluteUrl(url) ? undefined : baseURL,
    method,
    body,
    query: query || params,
    headers: reqHeaders,
    credentials: 'include',
    ...fetchOptions,
  })
}

const apiClient = {
  get<T = any>(url: string, options?: ApiOptions) {
    return request<T>('GET', url, undefined, options)
  },

  post<T = any>(url: string, body?: any, options?: ApiOptions) {
    return request<T>('POST', url, body, options)
  },

  put<T = any>(url: string, body?: any, options?: ApiOptions) {
    return request<T>('PUT', url, body, options)
  },

  delete<T = any>(url: string, options?: ApiOptions) {
    return request<T>('DELETE', url, undefined, options)
  },
}

export type ApiClient = typeof apiClient
export default apiClient
