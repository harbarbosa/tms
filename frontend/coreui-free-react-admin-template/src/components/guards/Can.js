import React from 'react'
import useAuthorization from '../../hooks/useAuthorization'

const Can = ({ permission, permissions = [], children, fallback = null }) => {
  const { hasPermission, hasAnyPermission } = useAuthorization()

  if (!permission && permissions.length === 0) {
    return children
  }

  const isAllowed = permission ? hasPermission(permission) : hasAnyPermission(permissions)

  return isAllowed ? children : fallback
}

export default Can
