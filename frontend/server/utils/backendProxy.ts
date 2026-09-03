import type { H3Event } from 'h3'
import { createError, getRequestURL, proxyRequest } from 'h3'

function normalizeBackendOrigin(value: unknown) {
  const raw = String(value || '').trim().replace(/\/+$/, '')
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`

  try {
    const target = new URL(withScheme)
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return ''
    return target.origin
  } catch {
    return ''
  }
}

export function proxyBackendRequest(event: H3Event) {
  const config = useRuntimeConfig(event)
  const backendOrigin = normalizeBackendOrigin(config.apiProxyTarget)
  if (!backendOrigin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Backend proxy is not configured',
    })
  }

  const requestURL = getRequestURL(event)
  const targetURL = new URL(`${requestURL.pathname}${requestURL.search}`, backendOrigin)
  return proxyRequest(event, targetURL.toString())
}
