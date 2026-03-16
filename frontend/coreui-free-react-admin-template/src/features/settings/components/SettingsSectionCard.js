import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

const SettingsSectionCard = ({ title, subtitle, children }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardHeader>
      <div className="fw-semibold">{title}</div>
      {subtitle ? <div className="small text-body-secondary mt-1">{subtitle}</div> : null}
    </CCardHeader>
    <CCardBody>{children}</CCardBody>
  </CCard>
)

export default SettingsSectionCard
