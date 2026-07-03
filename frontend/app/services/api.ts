type ApiOptions = {
  params?: Record<string, any>
  query?: Record<string, any>
  headers?: HeadersInit
  credentials?: RequestCredentials
  [key: string]: any
}

type ApiMethod = NonNullable<NonNullable<Parameters<typeof $fetch>[1]>['method']>

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function buildHeaders(headers?: HeadersInit) {
  const requestHeaders = new Headers(headers)
  const accessToken = useCookie<string | null>('access_token')

  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (accessToken.value) {
    requestHeaders.set('Authorization', `Bearer ${accessToken.value}`)
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
  const { params, query, headers, ...fetchOptions } = options

  const reqHeaders = buildHeaders(headers)
  if (body instanceof FormData) {
    reqHeaders.delete('Content-Type')
  }

  return await $fetch<T>(url, {
    baseURL: isAbsoluteUrl(url) ? undefined : config.public.apiBase,
    method,
    body,
    query: query || params,
    headers: reqHeaders,
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
