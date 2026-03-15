import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthorization from '../../hooks/useAuthorization'

const PermissionGuard = ({ permission, permissions = [], children }) => {
  const location = useLocation()
  const { hasPermission, hasAnyPermission } = useAuthorization()

  if (!permission && permissions.length === 0) {
    return children
  }

  const isAllowed = permission ? hasPermission(permission) : hasAnyPermission(permissions)

  if (!isAllowed) {
    return <Navigate to="/403" replace state={{ from: location }} />
  }

  return children
}

export default PermissionGuard
