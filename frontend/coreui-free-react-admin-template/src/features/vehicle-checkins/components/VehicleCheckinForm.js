import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react'

const VehicleCheckinForm = ({ values, errors, options, isSubmitting, onChange, onSubmit, submitLabel }) => {
  const selectedSchedule = (options.pickup_schedules || []).find((item) => String(item.id) === String(values.pickup_schedule_id))
  const selectedDocument = (options.transport_documents || []).find((item) => String(item.id) === String(values.transport_document_id))

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados do check-in</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Agendamento de coleta</CFormLabel>
              <CFormSelect name="pickup_schedule_id" value={values.pickup_schedule_id} onChange={onChange} invalid={Boolean(errors.pickup_schedule_id)}>
                <option value="">Selecione</option>
                {(options.pickup_schedules || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} - {item.unidade_origem} - {item.data_agendada}
                  </option>
                ))}
              </CFormSelect>
              {errors.pickup_schedule_id ? <div className="invalid-feedback d-block">{errors.pickup_schedule_id}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Ordem de transporte</CFormLabel>
              <CFormSelect name="transport_document_id" value={values.transport_document_id} onChange={onChange} invalid={Boolean(errors.transport_document_id)}>
                <option value="">Selecione</option>
                {(options.transport_documents || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.numero_ot}
                  </option>
                ))}
              </CFormSelect>
              {errors.transport_document_id ? <div className="invalid-feedback d-block">{errors.transport_document_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Transportadora</CFormLabel>
              <CFormSelect name="transporter_id" value={values.transporter_id} onChange={onChange} invalid={Boolean(errors.transporter_id)}>
                <option value="">Selecione</option>
                {(options.transporters || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.razao_social}
                  </option>
                ))}
              </CFormSelect>
              {errors.transporter_id ? <div className="invalid-feedback d-block">{errors.transporter_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Motorista</CFormLabel>
              <CFormSelect name="driver_id" value={values.driver_id} onChange={onChange} invalid={Boolean(errors.driver_id)}>
                <option value="">Selecione</option>
                {(options.drivers || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </CFormSelect>
              {errors.driver_id ? <div className="invalid-feedback d-block">{errors.driver_id}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Veiculo</CFormLabel>
              <CFormSelect name="vehicle_id" value={values.vehicle_id} onChange={onChange} invalid={Boolean(errors.vehicle_id)}>
                <option value="">Selecione</option>
                {(options.vehicles || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.placa}
                  </option>
                ))}
              </CFormSelect>
              {errors.vehicle_id ? <div className="invalid-feedback d-block">{errors.vehicle_id}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Placa</CFormLabel>
              <CFormInput name="placa" value={values.placa} onChange={onChange} invalid={Boolean(errors.placa)} />
              {errors.placa ? <div className="invalid-feedback d-block">{errors.placa}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Doca</CFormLabel>
              <CFormSelect name="doca" value={values.doca} onChange={onChange}>
                <option value="">Selecione</option>
                {(options.dockOptions || []).map((dock) => (
                  <option key={dock} value={dock}>
                    {dock}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {(options.statusOptions || []).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={3} className="d-flex align-items-end">
              <CFormCheck
                id="vehicle-checkin-divergencia"
                label="Marcar divergencia"
                checked={Boolean(values.divergencia)}
                onChange={onChange}
                name="divergencia"
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Horario de chegada</CFormLabel>
              <CFormInput type="datetime-local" name="horario_chegada" value={values.horario_chegada} onChange={onChange} invalid={Boolean(errors.horario_chegada)} />
              {errors.horario_chegada ? <div className="invalid-feedback d-block">{errors.horario_chegada}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Horario de entrada</CFormLabel>
              <CFormInput type="datetime-local" name="horario_entrada" value={values.horario_entrada} onChange={onChange} invalid={Boolean(errors.horario_entrada)} />
              {errors.horario_entrada ? <div className="invalid-feedback d-block">{errors.horario_entrada}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Horario de saida</CFormLabel>
              <CFormInput type="datetime-local" name="horario_saida" value={values.horario_saida} onChange={onChange} invalid={Boolean(errors.horario_saida)} />
              {errors.horario_saida ? <div className="invalid-feedback d-block">{errors.horario_saida}</div> : null}
            </CCol>
            {selectedSchedule ? (
              <CCol md={12}>
                <div className="rounded border bg-light px-3 py-2 small text-body-secondary">
                  Agendamento vinculado: {selectedSchedule.unidade_origem} | {selectedSchedule.data_agendada} | {selectedSchedule.hora_inicio} - {selectedSchedule.hora_fim}
                </div>
              </CCol>
            ) : null}
            {selectedDocument ? (
              <CCol md={12}>
                <div className="rounded border bg-light px-3 py-2 small text-body-secondary">
                  OT vinculada: {selectedDocument.numero_ot} | Coleta prevista: {selectedDocument.data_coleta_prevista || '-'}
                </div>
              </CCol>
            ) : null}
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={3} value={values.observacoes} onChange={onChange} />
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

export default VehicleCheckinForm
