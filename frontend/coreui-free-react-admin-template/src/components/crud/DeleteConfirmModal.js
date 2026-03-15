import React from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

const DeleteConfirmModal = ({ visible, title, message, isSubmitting, onClose, onConfirm }) => {
  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{message}</CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Excluindo...' : 'Excluir'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default DeleteConfirmModal
