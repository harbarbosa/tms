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
import { transportOrderStatuses } from '../utils/transportOrderValidation'

const TransportOrderForm = ({ values, errors, isSubmitting, onChange, onSubmit, submitLabel }) => {
  return (
    <CCard>
      <CCardHeader>Dados do pedido de transporte</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Cliente</CFormLabel>
              <CFormInput name="cliente_nome" value={values.cliente_nome} onChange={onChange} invalid={Boolean(errors.cliente_nome)} />
              {errors.cliente_nome ? <div className="invalid-feedback d-block">{errors.cliente_nome}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Documento do cliente</CFormLabel>
              <CFormInput name="documento_cliente" value={values.documento_cliente} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>CEP</CFormLabel>
              <CFormInput name="cep_entrega" value={values.cep_entrega} onChange={onChange} />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Endereco</CFormLabel>
              <CFormInput name="endereco_entrega" value={values.endereco_entrega} onChange={onChange} invalid={Boolean(errors.endereco_entrega)} />
              {errors.endereco_entrega ? <div className="invalid-feedback d-block">{errors.endereco_entrega}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Numero</CFormLabel>
              <CFormInput name="numero_entrega" value={values.numero_entrega} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Bairro</CFormLabel>
              <CFormInput name="bairro_entrega" value={values.bairro_entrega} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Cidade</CFormLabel>
              <CFormInput name="cidade_entrega" value={values.cidade_entrega} onChange={onChange} invalid={Boolean(errors.cidade_entrega)} />
              {errors.cidade_entrega ? <div className="invalid-feedback d-block">{errors.cidade_entrega}</div> : null}
            </CCol>
            <CCol md={1}>
              <CFormLabel>UF</CFormLabel>
              <CFormInput name="estado_entrega" maxLength={2} value={values.estado_entrega} onChange={onChange} invalid={Boolean(errors.estado_entrega)} />
              {errors.estado_entrega ? <div className="invalid-feedback d-block">{errors.estado_entrega}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Entrega prevista</CFormLabel>
              <CFormInput type="date" name="data_prevista_entrega" value={values.data_prevista_entrega} onChange={onChange} invalid={Boolean(errors.data_prevista_entrega)} />
              {errors.data_prevista_entrega ? <div className="invalid-feedback d-block">{errors.data_prevista_entrega}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Peso total (kg)</CFormLabel>
              <CFormInput type="number" step="0.01" name="peso_total" value={values.peso_total} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Volume total (m3)</CFormLabel>
              <CFormInput type="number" step="0.01" name="volume_total" value={values.volume_total} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Valor mercadoria</CFormLabel>
              <CFormInput type="number" step="0.01" name="valor_mercadoria" value={values.valor_mercadoria} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {transportOrderStatuses.map((status) => (
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

export default TransportOrderForm
