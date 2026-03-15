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

const DriverTable = ({ items, onDelete }) => {
  return (
    <CCard className="mb-4">
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nome</CTableHeaderCell>
              <CTableHeaderCell>CPF</CTableHeaderCell>
              <CTableHeaderCell>CNH</CTableHeaderCell>
              <CTableHeaderCell>Categoria</CTableHeaderCell>
              <CTableHeaderCell>Transportadora</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                  Nenhum motorista encontrado com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>{item.nome}</CTableDataCell>
                  <CTableDataCell>{item.cpf}</CTableDataCell>
                  <CTableDataCell>{item.cnh}</CTableDataCell>
                  <CTableDataCell>{item.categoria_cnh}</CTableDataCell>
                  <CTableDataCell>{item.transporter_nome_fantasia || item.transporter_razao_social}</CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={item.status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/registry/drivers/${item.id}/edit`}>
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

export default DriverTable
