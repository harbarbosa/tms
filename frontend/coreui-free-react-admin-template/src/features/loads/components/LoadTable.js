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

const LoadTable = ({ items, onDelete }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Codigo</CTableHeaderCell>
              <CTableHeaderCell>Origem</CTableHeaderCell>
              <CTableHeaderCell>Destino</CTableHeaderCell>
              <CTableHeaderCell>Janela prevista</CTableHeaderCell>
              <CTableHeaderCell>Pedidos</CTableHeaderCell>
              <CTableHeaderCell>Totais</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center text-body-secondary py-4">
                  Nenhuma carga encontrada com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell className="fw-semibold">{item.codigo_carga}</CTableDataCell>
                  <CTableDataCell>{`${item.origem_nome} - ${item.origem_cidade}/${item.origem_estado}`}</CTableDataCell>
                  <CTableDataCell>{`${item.destino_nome} - ${item.destino_cidade}/${item.destino_estado}`}</CTableDataCell>
                  <CTableDataCell>
                    <div>{item.data_prevista_saida}</div>
                    <small className="text-body-secondary">ate {item.data_prevista_entrega}</small>
                  </CTableDataCell>
                  <CTableDataCell>{item.orders_count || 0}</CTableDataCell>
                  <CTableDataCell>
                    <div>{item.peso_total || '-'} kg</div>
                    <small className="text-body-secondary">{formatCurrency(item.valor_total)}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={item.status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/operations/loads/${item.id}`}>
                        Detalhes
                      </CButton>
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/operations/loads/${item.id}/edit`}>
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

export default LoadTable
