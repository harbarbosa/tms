import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import getDefaultHomePath from '../../utils/homePaths'

const GuestGuard = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const isBootstrapped = useSelector((state) => state.auth.isBootstrapped)
  const user = useSelector((state) => state.auth.user)

  if (!isBootstrapped) {
    return (
      <div className="pt-5 text-center">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultHomePath(user)} replace />
  }

  return <Outlet />
}

export default GuestGuard
