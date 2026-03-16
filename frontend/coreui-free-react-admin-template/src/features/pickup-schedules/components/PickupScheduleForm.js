import React from 'react'
import {
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

const PickupScheduleForm = ({ values, errors, options, isSubmitting, onChange, onSubmit, submitLabel }) => {
  const selectedTransportDocument = (options.transport_documents || []).find(
    (item) => String(item.id) === String(values.transport_document_id),
  )

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados do agendamento</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Ordem de transporte</CFormLabel>
              <CFormSelect
                name="transport_document_id"
                value={values.transport_document_id}
                onChange={onChange}
                invalid={Boolean(errors.transport_document_id)}
              >
                <option value="">Selecione</option>
                {(options.transport_documents || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.numero_ot}
                  </option>
                ))}
              </CFormSelect>
              {errors.transport_document_id ? <div className="invalid-feedback d-block">{errors.transport_document_id}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Transportadora</CFormLabel>
              <CFormSelect
                name="transporter_id"
                value={values.transporter_id}
                onChange={onChange}
                invalid={Boolean(errors.transporter_id)}
              >
                <option value="">Selecione</option>
                {(options.transporters || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.razao_social}
                  </option>
                ))}
              </CFormSelect>
              {errors.transporter_id ? <div className="invalid-feedback d-block">{errors.transporter_id}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Unidade de origem</CFormLabel>
              <CFormSelect
                name="unidade_origem"
                value={values.unidade_origem}
                onChange={onChange}
                invalid={Boolean(errors.unidade_origem)}
              >
                <option value="">Selecione</option>
                {(options.unitOptions || []).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </CFormSelect>
              {errors.unidade_origem ? <div className="invalid-feedback d-block">{errors.unidade_origem}</div> : null}
            </CCol>
            <CCol md={2}>
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
            <CCol md={4}>
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
            <CCol md={4}>
              <CFormLabel>Data agendada</CFormLabel>
              <CFormInput type="date" name="data_agendada" value={values.data_agendada} onChange={onChange} invalid={Boolean(errors.data_agendada)} />
              {errors.data_agendada ? <div className="invalid-feedback d-block">{errors.data_agendada}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Hora inicio</CFormLabel>
              <CFormInput type="time" name="hora_inicio" value={values.hora_inicio} onChange={onChange} invalid={Boolean(errors.hora_inicio)} />
              {errors.hora_inicio ? <div className="invalid-feedback d-block">{errors.hora_inicio}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Hora fim</CFormLabel>
              <CFormInput type="time" name="hora_fim" value={values.hora_fim} onChange={onChange} invalid={Boolean(errors.hora_fim)} />
              {errors.hora_fim ? <div className="invalid-feedback d-block">{errors.hora_fim}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Janela de atendimento</CFormLabel>
              <CFormInput name="janela_atendimento" value={values.janela_atendimento} onChange={onChange} placeholder="Ex.: 08:00 as 10:00" />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Responsavel pelo agendamento</CFormLabel>
              <CFormInput name="responsavel_agendamento" value={values.responsavel_agendamento} onChange={onChange} />
            </CCol>
            {selectedTransportDocument ? (
              <CCol md={12}>
                <div className="rounded border bg-light px-3 py-2 small text-body-secondary">
                  OT vinculada: {selectedTransportDocument.numero_ot} | Coleta prevista: {selectedTransportDocument.data_coleta_prevista || '-'} | Entrega prevista: {selectedTransportDocument.data_entrega_prevista || '-'}
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

export default PickupScheduleForm
