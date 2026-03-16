import React from 'react'
import { CBadge, CCard, CCardBody, CCardText, CCardTitle, CCol, CRow } from '@coreui/react'

const ReportCatalogCards = ({ reports, activeReport, onSelect }) => (
  <CRow className="g-3 mb-4">
    {reports.map((report) => {
      const isActive = report.key === activeReport

      return (
        <CCol md={6} xl={4} key={report.key}>
          <CCard
            role="button"
            onClick={() => onSelect(report.key)}
            className={`h-100 border-0 shadow-sm ${isActive ? 'border border-primary' : ''}`}
          >
            <CCardBody>
              {report.sectionLabel ? (
                <div className="mb-2">
                  <CBadge color="info" textColor="white">
                    {report.sectionLabel}
                  </CBadge>
                </div>
              ) : null}
              <CCardTitle>{report.title}</CCardTitle>
              <CCardText className="text-body-secondary mb-0">{report.description}</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      )
    })}
  </CRow>
)

export default ReportCatalogCards
