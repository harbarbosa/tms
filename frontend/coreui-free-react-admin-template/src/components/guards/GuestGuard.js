import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'

const GuestGuard = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const isBootstrapped = useSelector((state) => state.auth.isBootstrapped)

  if (!isBootstrapped) {
    return (
      <div className="pt-5 text-center">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default GuestGuard
