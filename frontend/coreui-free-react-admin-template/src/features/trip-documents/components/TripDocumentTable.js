import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const formatDateTime = (value) => new Date(value).toLocaleString('pt-BR')

const TripDocumentTable = ({ items, onPreview, onDelete }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>OT</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Numero</CTableHeaderCell>
              <CTableHeaderCell>Arquivo</CTableHeaderCell>
              <CTableHeaderCell>Enviado por</CTableHeaderCell>
              <CTableHeaderCell>Data</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                  Nenhum documento encontrado com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell className="fw-semibold">{item.numero_ot}</CTableDataCell>
                  <CTableDataCell>{item.tipo_documento}</CTableDataCell>
                  <CTableDataCell>{item.numero_documento || '-'}</CTableDataCell>
                  <CTableDataCell>{item.nome_arquivo_original}</CTableDataCell>
                  <CTableDataCell>{item.enviado_por || '-'}</CTableDataCell>
                  <CTableDataCell>{formatDateTime(item.created_at)}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="secondary" variant="outline" size="sm" onClick={() => onPreview(item.id)}>
                        Visualizar
                      </CButton>
                      <CButton color="danger" variant="outline" size="sm" onClick={() => onDelete(item)}>
                        Excluir
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default TripDocumentTable
