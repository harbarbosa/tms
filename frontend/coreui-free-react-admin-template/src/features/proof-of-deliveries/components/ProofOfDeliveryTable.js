import React from 'react'
import { Link } from 'react-router-dom'
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

const ProofOfDeliveryTable = ({ items, onPreview, canEdit = true }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>OT</CTableHeaderCell>
              <CTableHeaderCell>Recebedor</CTableHeaderCell>
              <CTableHeaderCell>Documento</CTableHeaderCell>
              <CTableHeaderCell>Entrega real</CTableHeaderCell>
              <CTableHeaderCell>Arquivo</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">
                  Nenhum comprovante encontrado.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell className="fw-semibold">{item.numero_ot}</CTableDataCell>
                  <CTableDataCell>{item.nome_recebedor}</CTableDataCell>
                  <CTableDataCell>{item.documento_recebedor || '-'}</CTableDataCell>
                  <CTableDataCell>{formatDateTime(item.data_entrega_real)}</CTableDataCell>
                  <CTableDataCell>{item.nome_arquivo_original}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="secondary" variant="outline" size="sm" onClick={() => onPreview(item.id)}>
                        Visualizar
                      </CButton>
                      {canEdit ? (
                        <CButton color="info" variant="outline" size="sm" as={Link} to={`/execution/proof-of-deliveries/${item.id}/edit`}>
                          Editar
                        </CButton>
                      ) : null}
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

export default ProofOfDeliveryTable
