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

const typeLabelMap = {
  embarcador: 'Embarcador',
  transportadora: 'Transportadora',
  operador_logistico: 'Operador logistico',
  hibrida: 'Hibrida',
}

const CompanyTable = ({ items, canManage = false, onToggleStatus }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CTable hover responsive align="middle">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Empresa</CTableHeaderCell>
            <CTableHeaderCell>CNPJ</CTableHeaderCell>
            <CTableHeaderCell>Contato</CTableHeaderCell>
            <CTableHeaderCell>Cidade/UF</CTableHeaderCell>
            <CTableHeaderCell>Tipo</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                Nenhuma empresa encontrada com os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>
                  <div className="fw-semibold">{item.razao_social}</div>
                  <div className="small text-body-secondary">{item.nome_fantasia || '-'}</div>
                </CTableDataCell>
                <CTableDataCell>{item.cnpj || '-'}</CTableDataCell>
                <CTableDataCell>
                  <div>{item.email || '-'}</div>
                  <div className="small text-body-secondary">{item.telefone || '-'}</div>
                </CTableDataCell>
                <CTableDataCell>{[item.cidade, item.estado].filter(Boolean).join('/') || '-'}</CTableDataCell>
                <CTableDataCell>{typeLabelMap[item.tipo_empresa] || item.tipo_empresa || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                    <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/admin/companies/${item.id}`}>
                      Detalhes
                    </CButton>
                    {canManage ? (
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/admin/companies/${item.id}/edit`}>
                        Editar
                      </CButton>
                    ) : null}
                    {canManage ? (
                      <CButton
                        color={item.status === 'active' ? 'warning' : 'success'}
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(item)}
                      >
                        {item.status === 'active' ? 'Inativar' : 'Ativar'}
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

export default CompanyTable
