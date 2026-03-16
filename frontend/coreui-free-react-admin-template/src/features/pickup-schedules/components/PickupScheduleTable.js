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

const PickupScheduleTable = ({ items, canEdit }) => (
  <CCard className="shadow-sm border-0">
    <CCardBody className="p-0">
      <CTable align="middle" hover responsive className="mb-0">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Data</CTableHeaderCell>
            <CTableHeaderCell>Janela</CTableHeaderCell>
            <CTableHeaderCell>Transportadora</CTableHeaderCell>
            <CTableHeaderCell>Unidade / doca</CTableHeaderCell>
            <CTableHeaderCell>OT</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={7} className="text-center py-4 text-body-secondary">
                Nenhum agendamento encontrado para os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.data_agendada}</CTableDataCell>
                <CTableDataCell>
                  {item.hora_inicio} - {item.hora_fim}
                </CTableDataCell>
                <CTableDataCell>{item.transporter_name}</CTableDataCell>
                <CTableDataCell>
                  <div>{item.unidade_origem}</div>
                  <small className="text-body-secondary">{item.doca || 'Sem doca definida'}</small>
                </CTableDataCell>
                <CTableDataCell>{item.numero_ot || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <CButton color="secondary" size="sm" variant="outline" as={Link} to={`/execution/pickup-schedules/${item.id}`}>
                      Detalhes
                    </CButton>
                    {canEdit ? (
                      <CButton color="info" size="sm" variant="outline" as={Link} to={`/execution/pickup-schedules/${item.id}/edit`}>
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

export default PickupScheduleTable
