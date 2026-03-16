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
      className="mb-4 shadow-sm border-0"
      onClose={() => dispatch({ type: 'app/clearError' })}
    >
      <div className="fw-semibold mb-1">Nao foi possivel concluir a acao.</div>
      <div>{errorMessage}</div>
    </CAlert>
  )
}

export default GlobalErrorAlert
