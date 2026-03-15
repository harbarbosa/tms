import React from 'react'
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
import { loadStatuses } from '../utils/loadValidation'

const LoadForm = ({ values, errors, isSubmitting, onChange, onSubmit, submitLabel }) => {
  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados da carga</CCardHeader>
      <CCardBody>
        <CAlert color="info" className="border-0">
          Os totais da carga podem ser recalculados automaticamente ao vincular pedidos de transporte.
        </CAlert>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Nome da origem</CFormLabel>
              <CFormInput name="origem_nome" value={values.origem_nome} onChange={onChange} invalid={Boolean(errors.origem_nome)} />
              {errors.origem_nome ? <div className="invalid-feedback d-block">{errors.origem_nome}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Cidade de origem</CFormLabel>
              <CFormInput name="origem_cidade" value={values.origem_cidade} onChange={onChange} invalid={Boolean(errors.origem_cidade)} />
              {errors.origem_cidade ? <div className="invalid-feedback d-block">{errors.origem_cidade}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>UF origem</CFormLabel>
              <CFormInput
                name="origem_estado"
                maxLength={2}
                value={values.origem_estado}
                onChange={onChange}
                invalid={Boolean(errors.origem_estado)}
              />
              {errors.origem_estado ? <div className="invalid-feedback d-block">{errors.origem_estado}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Nome do destino</CFormLabel>
              <CFormInput name="destino_nome" value={values.destino_nome} onChange={onChange} invalid={Boolean(errors.destino_nome)} />
              {errors.destino_nome ? <div className="invalid-feedback d-block">{errors.destino_nome}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Cidade de destino</CFormLabel>
              <CFormInput name="destino_cidade" value={values.destino_cidade} onChange={onChange} invalid={Boolean(errors.destino_cidade)} />
              {errors.destino_cidade ? <div className="invalid-feedback d-block">{errors.destino_cidade}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>UF destino</CFormLabel>
              <CFormInput
                name="destino_estado"
                maxLength={2}
                value={values.destino_estado}
                onChange={onChange}
                invalid={Boolean(errors.destino_estado)}
              />
              {errors.destino_estado ? <div className="invalid-feedback d-block">{errors.destino_estado}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Data prevista de saida</CFormLabel>
              <CFormInput
                type="date"
                name="data_prevista_saida"
                value={values.data_prevista_saida}
                onChange={onChange}
                invalid={Boolean(errors.data_prevista_saida)}
              />
              {errors.data_prevista_saida ? <div className="invalid-feedback d-block">{errors.data_prevista_saida}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Data prevista de entrega</CFormLabel>
              <CFormInput
                type="date"
                name="data_prevista_entrega"
                value={values.data_prevista_entrega}
                onChange={onChange}
                invalid={Boolean(errors.data_prevista_entrega)}
              />
              {errors.data_prevista_entrega ? <div className="invalid-feedback d-block">{errors.data_prevista_entrega}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>Peso total (kg)</CFormLabel>
              <CFormInput type="number" step="0.01" name="peso_total" value={values.peso_total} onChange={onChange} />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Volume total (m3)</CFormLabel>
              <CFormInput type="number" step="0.01" name="volume_total" value={values.volume_total} onChange={onChange} />
            </CCol>
            <CCol md={2}>
              <CFormLabel>Valor total</CFormLabel>
              <CFormInput type="number" step="0.01" name="valor_total" value={values.valor_total} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {loadStatuses.map((status) => (
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

export default LoadForm
