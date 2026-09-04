import { proxyBackendRequest } from '../../utils/backendProxy'

export default defineEventHandler(event => proxyBackendRequest(event))
