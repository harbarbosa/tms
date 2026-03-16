import React from 'react'
import {
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'

const SettingsCatalogForm = ({ visible, item, errors, options, isSubmitting, onChange, onClose, onSubmit }) => (
  <CModal visible={visible} size="lg" onClose={onClose}>
    <CModalHeader>
      <CModalTitle>{item.id ? 'Editar item de catalogo' : 'Novo item de catalogo'}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CRow className="g-3">
        <CCol md={6}>
          <CFormLabel>Catalogo</CFormLabel>
          <CFormSelect name="catalog_type" value={item.catalog_type} onChange={onChange} invalid={Boolean(errors.catalog_type)}>
            <option value="">Selecione</option>
            {(options.catalogTypes || []).map((catalog) => (
              <option key={catalog.key} value={catalog.key}>
                {catalog.section} - {catalog.label}
              </option>
            ))}
          </CFormSelect>
          {errors.catalog_type ? <div className="invalid-feedback d-block">{errors.catalog_type}</div> : null}
        </CCol>
        <CCol md={3}>
          <CFormLabel>Escopo</CFormLabel>
          <CFormSelect name="scope" value={item.scope} onChange={onChange} invalid={Boolean(errors.scope)}>
            {(options.scopes || []).map((scope) => (
              <option key={scope.value} value={scope.value}>
                {scope.label}
              </option>
            ))}
          </CFormSelect>
          {errors.scope ? <div className="invalid-feedback d-block">{errors.scope}</div> : null}
        </CCol>
        <CCol md={3}>
          <CFormLabel>Status</CFormLabel>
          <CFormSelect name="status" value={item.status} onChange={onChange} invalid={Boolean(errors.status)}>
            {(options.statusOptions || []).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </CFormSelect>
          {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
        </CCol>
        <CCol md={4}>
          <CFormLabel>Codigo</CFormLabel>
          <CFormInput name="code" value={item.code} onChange={onChange} invalid={Boolean(errors.code)} />
          {errors.code ? <div className="invalid-feedback d-block">{errors.code}</div> : null}
        </CCol>
        <CCol md={6}>
          <CFormLabel>Nome</CFormLabel>
          <CFormInput name="label" value={item.label} onChange={onChange} invalid={Boolean(errors.label)} />
          {errors.label ? <div className="invalid-feedback d-block">{errors.label}</div> : null}
        </CCol>
        <CCol md={2}>
          <CFormLabel>Ordenacao</CFormLabel>
          <CFormInput
            type="number"
            min="0"
            name="sort_order"
            value={item.sort_order}
            onChange={onChange}
            invalid={Boolean(errors.sort_order)}
          />
          {errors.sort_order ? <div className="invalid-feedback d-block">{errors.sort_order}</div> : null}
        </CCol>
        <CCol md={12}>
          <CFormLabel>Descricao</CFormLabel>
          <CFormTextarea name="description" rows={3} value={item.description} onChange={onChange} />
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" onClick={onClose}>
        Cancelar
      </CButton>
      <CButton color="primary" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </CButton>
    </CModalFooter>
  </CModal>
)

export default SettingsCatalogForm
