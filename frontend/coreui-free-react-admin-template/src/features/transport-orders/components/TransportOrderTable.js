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

const TransportOrderTable = ({ items, onDelete }) => {
  return (
    <CCard className="mb-4">
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Numero</CTableHeaderCell>
              <CTableHeaderCell>Cliente</CTableHeaderCell>
              <CTableHeaderCell>Cidade/UF</CTableHeaderCell>
              <CTableHeaderCell>Entrega prevista</CTableHeaderCell>
              <CTableHeaderCell>Peso/Volume</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                  Nenhum pedido encontrado com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>{item.numero_pedido}</CTableDataCell>
                  <CTableDataCell>{item.cliente_nome}</CTableDataCell>
                  <CTableDataCell>{`${item.cidade_entrega}/${item.estado_entrega}`}</CTableDataCell>
                  <CTableDataCell>{item.data_prevista_entrega}</CTableDataCell>
                  <CTableDataCell>
                    {item.peso_total || '-'} kg / {item.volume_total || '-'} m3
                  </CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={item.status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/operations/transport-orders/${item.id}`}>
                        Detalhes
                      </CButton>
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/operations/transport-orders/${item.id}/edit`}>
                        Editar
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

export default TransportOrderTable
