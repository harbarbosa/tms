import { useSelector } from 'react-redux'

const useAuthorization = () => {
  const user = useSelector((state) => state.auth.user)
  const permissions = user?.permissions || []
  const role = user?.role || null
  const scope = user?.scope || {}

  const hasPermission = (permission) => {
    if (!permission) {
      return true
    }

    return permissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions = []) => {
    if (!requiredPermissions.length) {
      return true
    }

    return requiredPermissions.some((permission) => permissions.includes(permission))
  }

  const hasAllPermissions = (requiredPermissions = []) =>
    requiredPermissions.every((permission) => permissions.includes(permission))

  const isRole = (expectedRole) => role === expectedRole

  return {
    user,
    role,
    scope,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
  }
}

export default useAuthorization
