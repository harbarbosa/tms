export const getDefaultHomePath = (user) => {
  if (user?.role === 'carrier') {
    return '/carrier/dashboard'
  }

  if (user?.role === 'driver') {
    return '/driver/dashboard'
  }

  return '/dashboard'
}

export const resolvePostLoginPath = (user, requestedPath) => {
  const fallbackPath = getDefaultHomePath(user)

  if (!requestedPath || requestedPath === '/login' || requestedPath === '/register') {
    return fallbackPath
  }

  if (requestedPath.startsWith('/driver/') && user?.role !== 'driver') {
    return fallbackPath
  }

  if (requestedPath.startsWith('/carrier/') && user?.role !== 'carrier') {
    return fallbackPath
  }

  return requestedPath
}

export default getDefaultHomePath
