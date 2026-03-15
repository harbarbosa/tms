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

const DeliveryTrackingTable = ({ items }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>OT</CTableHeaderCell>
              <CTableHeaderCell>Referencia</CTableHeaderCell>
              <CTableHeaderCell>Transportadora</CTableHeaderCell>
              <CTableHeaderCell>Motorista/Veiculo</CTableHeaderCell>
              <CTableHeaderCell>Status atual</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">
                  Nenhum rastreamento encontrado com os filtros informados.
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
                    <CrudStatusBadge status={item.tracking_status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/execution/delivery-tracking/${item.id}`}>
                      Ver timeline
                    </CButton>
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

export default DeliveryTrackingTable
