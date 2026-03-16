import React from 'react'
import { Link } from 'react-router-dom'
import {
  CBadge,
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

const VehicleCheckinTable = ({ items, canEdit }) => (
  <CCard className="shadow-sm border-0">
    <CCardBody className="p-0">
      <CTable align="middle" hover responsive className="mb-0">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Chegada</CTableHeaderCell>
            <CTableHeaderCell>Transportadora</CTableHeaderCell>
            <CTableHeaderCell>Veiculo</CTableHeaderCell>
            <CTableHeaderCell>Doca</CTableHeaderCell>
            <CTableHeaderCell>OT</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Alertas</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={8} className="text-center py-4 text-body-secondary">
                Nenhum check-in encontrado para os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.horario_chegada || '-'}</CTableDataCell>
                <CTableDataCell>{item.transporter_name}</CTableDataCell>
                <CTableDataCell>
                  <div>{item.vehicle_plate || item.placa || '-'}</div>
                  <small className="text-body-secondary">{item.driver_name || 'Sem motorista'}</small>
                </CTableDataCell>
                <CTableDataCell>{item.doca || '-'}</CTableDataCell>
                <CTableDataCell>{item.numero_ot || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell>
                  {item.operational_flags?.delayed ? <CBadge color="warning" className="me-1">Atraso</CBadge> : null}
                  {item.operational_flags?.divergencia ? <CBadge color="danger">Divergencia</CBadge> : null}
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <CButton color="secondary" size="sm" variant="outline" as={Link} to={`/execution/vehicle-checkins/${item.id}`}>
                      Detalhes
                    </CButton>
                    {canEdit ? (
                      <CButton color="info" size="sm" variant="outline" as={Link} to={`/execution/vehicle-checkins/${item.id}/edit`}>
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

export default VehicleCheckinTable
