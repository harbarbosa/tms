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

const VehicleForm = ({
  values,
  errors,
  options,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
}) => {
  return (
    <CCard>
      <CCardHeader>Dados do veiculo</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Transportadora</CFormLabel>
              <CFormSelect
                name="transporter_id"
                value={values.transporter_id}
                onChange={onChange}
                invalid={Boolean(errors.transporter_id)}
              >
                <option value="">Selecione</option>
                {(options.transporters || []).map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.nome_fantasia || carrier.razao_social}
                  </option>
                ))}
              </CFormSelect>
              {errors.transporter_id ? <div className="invalid-feedback d-block">{errors.transporter_id}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Placa</CFormLabel>
              <CFormInput name="placa" value={values.placa} onChange={onChange} invalid={Boolean(errors.placa)} />
              {errors.placa ? <div className="invalid-feedback d-block">{errors.placa}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>RENAVAM</CFormLabel>
              <CFormInput name="renavam" value={values.renavam} onChange={onChange} invalid={Boolean(errors.renavam)} />
              {errors.renavam ? <div className="invalid-feedback d-block">{errors.renavam}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Tipo de veiculo</CFormLabel>
              <CFormSelect
                name="tipo_veiculo"
                value={values.tipo_veiculo}
                onChange={onChange}
                invalid={Boolean(errors.tipo_veiculo)}
              >
                <option value="">Selecione</option>
                {(options.vehicleTypeOptions || []).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </CFormSelect>
              {errors.tipo_veiculo ? <div className="invalid-feedback d-block">{errors.tipo_veiculo}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Tipo de carroceria</CFormLabel>
              <CFormSelect name="tipo_carroceria" value={values.tipo_carroceria} onChange={onChange}>
                <option value="">Selecione</option>
                {(options.bodyTypeOptions || []).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel>Ano modelo</CFormLabel>
              <CFormInput type="number" name="ano_modelo" value={values.ano_modelo} onChange={onChange} />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {(options.statusOptions || []).map((status) => (
                  <option key={status} value={status}>
                    {status === 'active' ? 'Ativo' : status === 'inactive' ? 'Inativo' : status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Capacidade peso (kg)</CFormLabel>
              <CFormInput type="number" step="0.01" name="capacidade_peso" value={values.capacidade_peso} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Capacidade volume (m3)</CFormLabel>
              <CFormInput type="number" step="0.01" name="capacidade_volume" value={values.capacidade_volume} onChange={onChange} />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={4} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex gap-2 justify-content-end">
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : submitLabel}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default VehicleForm
