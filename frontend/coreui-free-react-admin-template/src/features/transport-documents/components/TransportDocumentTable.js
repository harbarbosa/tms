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
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const TransportDocumentTable = ({ items, onDelete, canEdit = true, canDelete = true }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Numero OT</CTableHeaderCell>
              <CTableHeaderCell>Referencia</CTableHeaderCell>
              <CTableHeaderCell>Transportadora</CTableHeaderCell>
              <CTableHeaderCell>Motorista/Veiculo</CTableHeaderCell>
              <CTableHeaderCell>Janela</CTableHeaderCell>
              <CTableHeaderCell>Frete</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center text-body-secondary py-4">
                  Nenhuma ordem de transporte encontrada com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell className="fw-semibold">{item.numero_ot}</CTableDataCell>
                  <CTableDataCell>{item.codigo_carga || item.numero_pedido || '-'}</CTableDataCell>
                  <CTableDataCell>{item.transporter_name}</CTableDataCell>
                  <CTableDataCell>
                    <div>{item.driver_name || '-'}</div>
                    <small className="text-body-secondary">{item.vehicle_plate || '-'}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div>{item.data_coleta_prevista}</div>
                    <small className="text-body-secondary">ate {item.data_entrega_prevista}</small>
                  </CTableDataCell>
                  <CTableDataCell>{item.valor_frete_contratado ? formatCurrency(item.valor_frete_contratado) : '-'}</CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={item.status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/operations/transport-documents/${item.id}`}>
                        Detalhes
                      </CButton>
                      {canEdit ? (
                        <CButton color="info" variant="outline" size="sm" as={Link} to={`/operations/transport-documents/${item.id}/edit`}>
                          Editar
                        </CButton>
                      ) : null}
                      {canDelete ? (
                        <CButton color="danger" variant="outline" size="sm" onClick={() => onDelete(item)}>
                          Excluir
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

export default TransportDocumentTable
