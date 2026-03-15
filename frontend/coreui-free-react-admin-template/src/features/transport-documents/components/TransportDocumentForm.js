import React, { useMemo } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { transportDocumentStatuses } from '../utils/transportDocumentValidation'

const TransportDocumentForm = ({
  values,
  errors,
  options,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
}) => {
  const filteredDrivers = useMemo(
    () =>
      (options.drivers || []).filter(
        (driver) => !values.transporter_id || String(driver.transporter_id) === String(values.transporter_id),
      ),
    [options.drivers, values.transporter_id],
  )

  const filteredVehicles = useMemo(
    () =>
      (options.vehicles || []).filter(
        (vehicle) => !values.transporter_id || String(vehicle.transporter_id) === String(values.transporter_id),
      ),
    [options.vehicles, values.transporter_id],
  )

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados da ordem de transporte</CCardHeader>
      <CCardBody>
        <CAlert color="info" className="border-0">
          Esta OT formaliza a contratacao do frete e servira de base para rastreamento e comprovante de entrega.
        </CAlert>
        {errors.referencia ? <CAlert color="danger">{errors.referencia}</CAlert> : null}
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Carga</CFormLabel>
              <CFormSelect name="carga_id" value={values.carga_id} onChange={onChange} invalid={Boolean(errors.carga_id)}>
                <option value="">Selecione</option>
                {(options.loads || []).map((load) => (
                  <option key={load.id} value={load.id}>
                    {load.codigo_carga} - {load.origem_cidade}/{load.origem_estado} para {load.destino_cidade}/{load.destino_estado}
                  </option>
                ))}
              </CFormSelect>
              {errors.carga_id ? <div className="invalid-feedback d-block">{errors.carga_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Pedido</CFormLabel>
              <CFormSelect name="pedido_id" value={values.pedido_id} onChange={onChange} invalid={Boolean(errors.pedido_id)}>
                <option value="">Selecione</option>
                {(options.transport_orders || []).map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.numero_pedido} - {order.cliente_nome}
                  </option>
                ))}
              </CFormSelect>
              {errors.pedido_id ? <div className="invalid-feedback d-block">{errors.pedido_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Transportadora</CFormLabel>
              <CFormSelect name="transporter_id" value={values.transporter_id} onChange={onChange} invalid={Boolean(errors.transporter_id)}>
                <option value="">Selecione</option>
                {(options.transporters || []).map((transporter) => (
                  <option key={transporter.id} value={transporter.id}>
                    {transporter.razao_social}
                  </option>
                ))}
              </CFormSelect>
              {errors.transporter_id ? <div className="invalid-feedback d-block">{errors.transporter_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Motorista</CFormLabel>
              <CFormSelect name="driver_id" value={values.driver_id} onChange={onChange} invalid={Boolean(errors.driver_id)}>
                <option value="">Selecione</option>
                {filteredDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.nome}
                  </option>
                ))}
              </CFormSelect>
              {errors.driver_id ? <div className="invalid-feedback d-block">{errors.driver_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Veiculo</CFormLabel>
              <CFormSelect name="vehicle_id" value={values.vehicle_id} onChange={onChange} invalid={Boolean(errors.vehicle_id)}>
                <option value="">Selecione</option>
                {filteredVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.tipo_veiculo}
                  </option>
                ))}
              </CFormSelect>
              {errors.vehicle_id ? <div className="invalid-feedback d-block">{errors.vehicle_id}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>Coleta prevista</CFormLabel>
              <CFormInput
                type="date"
                name="data_coleta_prevista"
                value={values.data_coleta_prevista}
                onChange={onChange}
                invalid={Boolean(errors.data_coleta_prevista)}
              />
              {errors.data_coleta_prevista ? <div className="invalid-feedback d-block">{errors.data_coleta_prevista}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>Entrega prevista</CFormLabel>
              <CFormInput
                type="date"
                name="data_entrega_prevista"
                value={values.data_entrega_prevista}
                onChange={onChange}
                invalid={Boolean(errors.data_entrega_prevista)}
              />
              {errors.data_entrega_prevista ? <div className="invalid-feedback d-block">{errors.data_entrega_prevista}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Frete contratado</CFormLabel>
              <CFormInput
                type="number"
                step="0.01"
                name="valor_frete_contratado"
                value={values.valor_frete_contratado}
                onChange={onChange}
                invalid={Boolean(errors.valor_frete_contratado)}
              />
              {errors.valor_frete_contratado ? <div className="invalid-feedback d-block">{errors.valor_frete_contratado}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {transportDocumentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={4} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex justify-content-end">
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : submitLabel}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default TransportDocumentForm
