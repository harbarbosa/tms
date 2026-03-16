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
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="align-items-center g-3">
          <CCol md={8}>
            <h3 className="mb-1">{title}</h3>
            {description ? <p className="text-body-secondary mb-0">{description}</p> : null}
          </CCol>
          <CCol md={4} className="text-md-end mt-3 mt-md-0">
            {canCreate ? (
              <CButton color="primary" as={Link} to={createPath} className="px-4">
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
