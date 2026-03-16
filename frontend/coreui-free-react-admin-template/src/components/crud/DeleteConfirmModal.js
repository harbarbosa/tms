import React from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

const DeleteConfirmModal = ({
  visible,
  title,
  message,
  isSubmitting,
  onClose,
  onConfirm,
  confirmLabel = 'Excluir',
  submittingLabel = 'Excluindo...',
  confirmColor = 'danger',
}) => {
  return (
    <CModal visible={visible} alignment="center" onClose={onClose}>
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="fw-semibold mb-2">Esta acao nao pode ser desfeita.</div>
        <div className="text-body-secondary">{message}</div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color={confirmColor} onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : confirmLabel}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default DeleteConfirmModal
