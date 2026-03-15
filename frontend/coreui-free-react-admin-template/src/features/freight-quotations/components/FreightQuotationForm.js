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
import { proposalStatuses, quotationStatuses } from '../utils/freightQuotationValidation'

const FreightQuotationForm = ({
  values,
  errors,
  options,
  isSubmitting,
  onChange,
  onProposalChange,
  onAddProposal,
  onRemoveProposal,
  onSubmit,
  submitLabel,
}) => {
  const referenceOptions =
    values.tipo_referencia === 'pedido' ? options.transport_orders || [] : options.loads || []

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Cotacao de frete</CCardHeader>
      <CCardBody>
        <CAlert color="info" className="border-0">
          Cadastre a referencia operacional e compare as propostas recebidas das transportadoras homologadas.
        </CAlert>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormLabel>Tipo de referencia</CFormLabel>
              <CFormSelect name="tipo_referencia" value={values.tipo_referencia} onChange={onChange} invalid={Boolean(errors.tipo_referencia)}>
                <option value="">Selecione</option>
                <option value="pedido">Pedido</option>
                <option value="carga">Carga</option>
              </CFormSelect>
              {errors.tipo_referencia ? <div className="invalid-feedback d-block">{errors.tipo_referencia}</div> : null}
            </CCol>
            <CCol md={5}>
              <CFormLabel>Referencia</CFormLabel>
              <CFormSelect name="referencia_id" value={values.referencia_id} onChange={onChange} invalid={Boolean(errors.referencia_id)}>
                <option value="">Selecione</option>
                {referenceOptions.map((reference) => (
                  <option key={reference.id} value={reference.id}>
                    {values.tipo_referencia === 'pedido'
                      ? `${reference.numero_pedido} - ${reference.cliente_nome}`
                      : `${reference.codigo_carga} - ${reference.origem_cidade}/${reference.origem_estado} -> ${reference.destino_cidade}/${reference.destino_estado}`}
                  </option>
                ))}
              </CFormSelect>
              {errors.referencia_id ? <div className="invalid-feedback d-block">{errors.referencia_id}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>Data envio</CFormLabel>
              <CFormInput type="date" name="data_envio" value={values.data_envio} onChange={onChange} invalid={Boolean(errors.data_envio)} />
              {errors.data_envio ? <div className="invalid-feedback d-block">{errors.data_envio}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>Limite resposta</CFormLabel>
              <CFormInput
                type="date"
                name="data_limite_resposta"
                value={values.data_limite_resposta}
                onChange={onChange}
                invalid={Boolean(errors.data_limite_resposta)}
              />
              {errors.data_limite_resposta ? <div className="invalid-feedback d-block">{errors.data_limite_resposta}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Status da cotacao</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {quotationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={9}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={3} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>

          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div>
              <strong>Propostas das transportadoras</strong>
              {errors.proposals ? <div className="text-danger small mt-1">{errors.proposals}</div> : null}
            </div>
            <CButton color="secondary" variant="outline" type="button" onClick={onAddProposal}>
              Adicionar proposta
            </CButton>
          </div>

          <div className="mt-3 d-flex flex-column gap-3">
            {(values.proposals || []).map((proposal, index) => (
              <CCard key={index} className="border">
                <CCardBody>
                  <CRow className="g-3 align-items-end">
                    <CCol md={4}>
                      <CFormLabel>Transportadora</CFormLabel>
                      <CFormSelect
                        value={proposal.transporter_id}
                        onChange={(event) => onProposalChange(index, 'transporter_id', event.target.value)}
                        invalid={Boolean(errors[`proposals.${index}.transporter_id`])}
                      >
                        <option value="">Selecione</option>
                        {(options.transporters || []).map((transporter) => (
                          <option key={transporter.id} value={transporter.id}>
                            {transporter.razao_social}
                          </option>
                        ))}
                      </CFormSelect>
                      {errors[`proposals.${index}.transporter_id`] ? (
                        <div className="invalid-feedback d-block">{errors[`proposals.${index}.transporter_id`]}</div>
                      ) : null}
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Valor frete</CFormLabel>
                      <CFormInput
                        type="number"
                        step="0.01"
                        value={proposal.valor_frete}
                        onChange={(event) => onProposalChange(index, 'valor_frete', event.target.value)}
                        invalid={Boolean(errors[`proposals.${index}.valor_frete`])}
                      />
                      {errors[`proposals.${index}.valor_frete`] ? (
                        <div className="invalid-feedback d-block">{errors[`proposals.${index}.valor_frete`]}</div>
                      ) : null}
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Prazo dias</CFormLabel>
                      <CFormInput
                        type="number"
                        value={proposal.prazo_entrega_dias}
                        onChange={(event) => onProposalChange(index, 'prazo_entrega_dias', event.target.value)}
                        invalid={Boolean(errors[`proposals.${index}.prazo_entrega_dias`])}
                      />
                      {errors[`proposals.${index}.prazo_entrega_dias`] ? (
                        <div className="invalid-feedback d-block">{errors[`proposals.${index}.prazo_entrega_dias`]}</div>
                      ) : null}
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Status resposta</CFormLabel>
                      <CFormSelect
                        value={proposal.status_resposta}
                        onChange={(event) => onProposalChange(index, 'status_resposta', event.target.value)}
                        invalid={Boolean(errors[`proposals.${index}.status_resposta`])}
                      >
                        {proposalStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </CFormSelect>
                      {errors[`proposals.${index}.status_resposta`] ? (
                        <div className="invalid-feedback d-block">{errors[`proposals.${index}.status_resposta`]}</div>
                      ) : null}
                    </CCol>
                    <CCol md={2} className="text-end">
                      <CButton color="danger" variant="outline" type="button" onClick={() => onRemoveProposal(index)}>
                        Remover
                      </CButton>
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel>Observacoes da proposta</CFormLabel>
                      <CFormTextarea
                        rows={2}
                        value={proposal.observacoes}
                        onChange={(event) => onProposalChange(index, 'observacoes', event.target.value)}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            ))}
          </div>

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

export default FreightQuotationForm
