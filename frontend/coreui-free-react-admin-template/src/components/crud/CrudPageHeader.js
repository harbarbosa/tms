import React from 'react'
import { CButton, CCard, CCardBody, CCol, CRow } from '@coreui/react'
import { Link } from 'react-router-dom'

const CrudPageHeader = ({
  title,
  description,
  createPath,
  createLabel = 'Novo',
  canCreate = true,
}) => {
  return (
    <CCard className="mb-4">
      <CCardBody>
        <CRow className="align-items-center">
          <CCol md={8}>
            <h4 className="mb-1">{title}</h4>
            <p className="text-body-secondary mb-0">{description}</p>
          </CCol>
          <CCol md={4} className="text-md-end mt-3 mt-md-0">
            {canCreate ? (
              <CButton color="primary" as={Link} to={createPath}>
                {createLabel}
              </CButton>
            ) : null}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default CrudPageHeader
