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

const ProofOfDeliveryForm = ({ values, errors, options, isSubmitting, isEdit, onChange, onFileChange, onSubmit }) => {
  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Comprovante de entrega</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormLabel>OT</CFormLabel>
              <CFormSelect
                name="ordem_transporte_id"
                value={values.ordem_transporte_id}
                onChange={onChange}
                invalid={Boolean(errors.ordem_transporte_id)}
              >
                <option value="">Selecione</option>
                {(options.transport_documents || []).map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.numero_ot}
                  </option>
                ))}
              </CFormSelect>
              {errors.ordem_transporte_id ? <div className="invalid-feedback d-block">{errors.ordem_transporte_id}</div> : null}
            </CCol>
            <CCol md={12} lg={4}>
              <CFormLabel>Data/hora da entrega</CFormLabel>
              <CFormInput
                type="datetime-local"
                name="data_entrega_real"
                value={values.data_entrega_real}
                onChange={onChange}
                invalid={Boolean(errors.data_entrega_real)}
              />
              {errors.data_entrega_real ? <div className="invalid-feedback d-block">{errors.data_entrega_real}</div> : null}
            </CCol>
            <CCol md={12} lg={4}>
              <CFormLabel>Recebedor</CFormLabel>
              <CFormInput name="nome_recebedor" value={values.nome_recebedor} onChange={onChange} invalid={Boolean(errors.nome_recebedor)} />
              {errors.nome_recebedor ? <div className="invalid-feedback d-block">{errors.nome_recebedor}</div> : null}
            </CCol>
            <CCol md={12} lg={4}>
              <CFormLabel>Documento do recebedor</CFormLabel>
              <CFormInput name="documento_recebedor" value={values.documento_recebedor} onChange={onChange} />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Arquivo do comprovante</CFormLabel>
              <CFormInput type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} invalid={Boolean(errors.arquivo_comprovante)} />
              {errors.arquivo_comprovante ? <div className="invalid-feedback d-block">{errors.arquivo_comprovante}</div> : null}
              {isEdit && values.nome_arquivo_original ? (
                <small className="text-body-secondary d-block mt-1">Arquivo atual: {values.nome_arquivo_original}</small>
              ) : null}
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes da entrega</CFormLabel>
              <CFormTextarea name="observacoes_entrega" rows={4} value={values.observacoes_entrega} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex justify-content-end">
            <CButton color="primary" className="tms-mobile-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar comprovante' : 'Criar comprovante'}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ProofOfDeliveryForm
