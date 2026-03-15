import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CAlert } from '@coreui/react'

const GlobalErrorAlert = () => {
  const dispatch = useDispatch()
  const errorMessage = useSelector((state) => state.app.error)

  if (!errorMessage) {
    return null
  }

  return (
    <CAlert
      color="danger"
      dismissible
      className="mb-4"
      onClose={() => dispatch({ type: 'app/clearError' })}
    >
      {errorMessage}
    </CAlert>
  )
}

export default GlobalErrorAlert
