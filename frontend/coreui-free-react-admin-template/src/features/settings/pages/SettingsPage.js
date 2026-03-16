import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  CAlert,
  CButton,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
} from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudLoadingState from '../../../components/crud/CrudLoadingState'
import CrudPagination from '../../../components/crud/CrudPagination'
import useAuthorization from '../../../hooks/useAuthorization'
import SettingsCatalogFilters from '../components/SettingsCatalogFilters'
import SettingsCatalogForm from '../components/SettingsCatalogForm'
import SettingsCatalogTable from '../components/SettingsCatalogTable'
import SettingsSectionCard from '../components/SettingsSectionCard'
import settingsService from '../services/settingsService'

const emptyGlobal = {
  general: {
    system_name: '',
    logo_url: '',
    contact_email: '',
  },
  localization: {
    timezone: '',
    date_format: '',
    time_format: '',
  },
  upload_rules: {
    max_file_size_mb: 10,
    allowed_extensions: '',
  },
}

const emptyCompany = {
  default_statuses: {
    transport_order_default_status: '',
    load_default_status: '',
    pickup_schedule_default_status: '',
    vehicle_checkin_default_status: '',
  },
  upload_rules: {
    company_upload_max_file_size_mb: 15,
    company_allowed_extensions: '',
  },
  operational: {
    delivery_tolerance_hours: 2,
    pickup_window_minutes: 30,
    auto_block_divergent_financial: true,
  },
  limits: {
    limite_usuarios: 10,
    limite_transportadoras: 10,
    limite_veiculos: 50,
    limite_motoristas: 50,
  },
}

const defaultCatalogFilters = {
  search: '',
  catalog_type: '',
  scope: 'company',
  status: 'active',
  perPage: '10',
}

const emptyCatalogForm = {
  id: null,
  catalog_type: '',
  scope: 'company',
  code: '',
  label: '',
  description: '',
  sort_order: 0,
  status: 'active',
}

const SettingsPage = () => {
  const dispatch = useDispatch()
  const { hasPermission } = useAuthorization()
  const [activeScope, setActiveScope] = useState('company')
  const [globalSettings, setGlobalSettings] = useState(emptyGlobal)
  const [companySettings, setCompanySettings] = useState(emptyCompany)
  const [options, setOptions] = useState({
    timezones: [],
    date_formats: [],
    time_formats: [],
    transport_order_statuses: [],
    load_statuses: [],
    pickup_schedule_statuses: [],
    vehicle_checkin_statuses: [],
  })
  const [catalogOptions, setCatalogOptions] = useState({
    catalogTypes: [],
    scopes: [],
    statusOptions: [],
  })
  const [catalogFilters, setCatalogFilters] = useState(defaultCatalogFilters)
  const [appliedCatalogFilters, setAppliedCatalogFilters] = useState(defaultCatalogFilters)
  const [catalogItems, setCatalogItems] = useState([])
  const [catalogMeta, setCatalogMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [catalogForm, setCatalogForm] = useState(emptyCatalogForm)
  const [catalogErrors, setCatalogErrors] = useState({})
  const [catalogModalVisible, setCatalogModalVisible] = useState(false)
  const [isCatalogSubmitting, setIsCatalogSubmitting] = useState(false)
  const [capabilities, setCapabilities] = useState({
    can_manage_global: false,
    can_manage_company: false,
  })
  const [companyInfo, setCompanyInfo] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)

  const canManageSettings = hasPermission('settings.manage')

  const sortedCatalogTypes = useMemo(
    () =>
      [...(catalogOptions.catalogTypes || [])].sort((left, right) => {
        const leftLabel = `${left.section} ${left.label}`
        const rightLabel = `${right.section} ${right.label}`
        return leftLabel.localeCompare(rightLabel)
      }),
    [catalogOptions.catalogTypes],
  )

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await settingsService.fetch()
      setGlobalSettings({ ...emptyGlobal, ...(response.global || {}) })
      setCompanySettings({ ...emptyCompany, ...(response.company || {}) })
      setOptions(response.options || {})
      setCapabilities(response.capabilities || {})
      setCompanyInfo(response.companyInfo || null)

      if (!(response.capabilities?.can_manage_global) && activeScope === 'global') {
        setActiveScope('company')
      }
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCatalogOptions = async () => {
    try {
      const response = await settingsService.catalogOptions()
      setCatalogOptions(response)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  const loadCatalogs = async (page = 1, currentFilters = appliedCatalogFilters) => {
    setIsCatalogLoading(true)
    try {
      const response = await settingsService.listCatalogs({
        ...currentFilters,
        page,
        perPage: currentFilters.perPage,
      })
      setCatalogItems(response.items || [])
      setCatalogMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsCatalogLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
    loadCatalogOptions()
  }, [])

  useEffect(() => {
    if (activeScope === 'catalogs') {
      loadCatalogs(1, appliedCatalogFilters)
    }
  }, [activeScope, appliedCatalogFilters])

  const handleGlobalChange = (section, field, value) => {
    setGlobalSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  const handleCompanyChange = (section, field, value) => {
    setCompanySettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  const saveGlobal = async () => {
    try {
      await settingsService.updateGlobal(globalSettings)
      setFeedback('Configuracoes globais salvas com sucesso.')
      await loadSettings()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  const saveCompany = async () => {
    try {
      await settingsService.updateCompany(companySettings)
      setFeedback('Configuracoes da empresa salvas com sucesso.')
      await loadSettings()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  const handleCatalogFilterChange = (event) => {
    const { name, value } = event.target
    setCatalogFilters((current) => ({ ...current, [name]: value }))
  }

  const handleCatalogSearch = () => {
    setAppliedCatalogFilters(catalogFilters)
  }

  const handleCatalogReset = () => {
    setCatalogFilters(defaultCatalogFilters)
    setAppliedCatalogFilters(defaultCatalogFilters)
  }

  const openCreateCatalogModal = () => {
    setCatalogErrors({})
    setCatalogForm(emptyCatalogForm)
    setCatalogModalVisible(true)
  }

  const openEditCatalogModal = (item) => {
    setCatalogErrors({})
    setCatalogForm({
      id: item.id,
      catalog_type: item.catalog_type || '',
      scope: item.scope || 'company',
      code: item.code || '',
      label: item.label || '',
      description: item.description || '',
      sort_order: item.sort_order ?? 0,
      status: item.status || 'active',
    })
    setCatalogModalVisible(true)
  }

  const closeCatalogModal = () => {
    setCatalogModalVisible(false)
    setCatalogErrors({})
    setCatalogForm(emptyCatalogForm)
  }

  const handleCatalogFormChange = (event) => {
    const { name, value } = event.target
    setCatalogForm((current) => ({ ...current, [name]: value }))
    setCatalogErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submitCatalogForm = async () => {
    setIsCatalogSubmitting(true)
    try {
      const payload = {
        ...catalogForm,
        sort_order: Number(catalogForm.sort_order || 0),
      }

      if (catalogForm.id) {
        await settingsService.updateCatalogItem(catalogForm.id, payload)
        setFeedback('Item de catalogo atualizado com sucesso.')
      } else {
        await settingsService.createCatalogItem(payload)
        setFeedback('Item de catalogo criado com sucesso.')
      }

      closeCatalogModal()
      await loadCatalogs(catalogMeta.page || 1, appliedCatalogFilters)
    } catch (error) {
      if (error.data?.errors) {
        setCatalogErrors(error.data.errors)
      }
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsCatalogSubmitting(false)
    }
  }

  const handleToggleCatalogStatus = async (item) => {
    try {
      const nextStatus = item.status === 'active' ? 'inactive' : 'active'
      await settingsService.updateCatalogItemStatus(item.id, nextStatus)
      setFeedback(`Item ${nextStatus === 'active' ? 'ativado' : 'inativado'} com sucesso.`)
      await loadCatalogs(catalogMeta.page || 1, appliedCatalogFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  if (isLoading) {
    return <CrudLoadingState message="Carregando configuracoes..." />
  }

  return (
    <>
      <CrudPageHeader
        title="Configuracoes do Sistema"
        description="Centralize parametros globais, regras operacionais e catalogos reutilizaveis em uma interface unica."
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <CNav variant="tabs" className="mb-4">
        {capabilities.can_manage_global ? (
          <CNavItem>
            <CNavLink active={activeScope === 'global'} onClick={() => setActiveScope('global')} role="button">
              Ambiente administrativo
            </CNavLink>
          </CNavItem>
        ) : null}
        <CNavItem>
          <CNavLink active={activeScope === 'company'} onClick={() => setActiveScope('company')} role="button">
            Empresa atual
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeScope === 'catalogs'} onClick={() => setActiveScope('catalogs')} role="button">
            Catalogos
          </CNavLink>
        </CNavItem>
      </CNav>

      {activeScope === 'global' ? (
        <>
          <SettingsSectionCard title="Identidade do sistema" subtitle="Parametros gerais do ambiente administrativo.">
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>Nome do sistema</CFormLabel>
                <CFormInput
                  value={globalSettings.general.system_name}
                  onChange={(event) => handleGlobalChange('general', 'system_name', event.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Logo URL</CFormLabel>
                <CFormInput
                  value={globalSettings.general.logo_url}
                  onChange={(event) => handleGlobalChange('general', 'logo_url', event.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>E-mail de contato</CFormLabel>
                <CFormInput
                  type="email"
                  value={globalSettings.general.contact_email}
                  onChange={(event) => handleGlobalChange('general', 'contact_email', event.target.value)}
                />
              </CCol>
            </CRow>
          </SettingsSectionCard>

          <SettingsSectionCard title="Localizacao e formatos" subtitle="Padroes globais de data, hora e timezone.">
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>Timezone</CFormLabel>
                <CFormSelect
                  value={globalSettings.localization.timezone}
                  onChange={(event) => handleGlobalChange('localization', 'timezone', event.target.value)}
                >
                  {options.timezones.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Formato de data</CFormLabel>
                <CFormSelect
                  value={globalSettings.localization.date_format}
                  onChange={(event) => handleGlobalChange('localization', 'date_format', event.target.value)}
                >
                  {options.date_formats.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Formato de hora</CFormLabel>
                <CFormSelect
                  value={globalSettings.localization.time_format}
                  onChange={(event) => handleGlobalChange('localization', 'time_format', event.target.value)}
                >
                  {options.time_formats.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </SettingsSectionCard>

          <SettingsSectionCard title="Regras globais de upload" subtitle="Padroes iniciais de documentos do sistema.">
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>Tamanho maximo (MB)</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={globalSettings.upload_rules.max_file_size_mb}
                  onChange={(event) => handleGlobalChange('upload_rules', 'max_file_size_mb', event.target.value)}
                />
              </CCol>
              <CCol md={8}>
                <CFormLabel>Extensoes permitidas</CFormLabel>
                <CFormInput
                  value={globalSettings.upload_rules.allowed_extensions}
                  onChange={(event) => handleGlobalChange('upload_rules', 'allowed_extensions', event.target.value)}
                />
              </CCol>
            </CRow>
          </SettingsSectionCard>

          <div className="d-flex justify-content-end">
            <CButton color="primary" onClick={saveGlobal} disabled={!capabilities.can_manage_global || !canManageSettings}>
              Salvar configuracoes globais
            </CButton>
          </div>
        </>
      ) : null}

      {activeScope === 'company' ? (
        <>
          <SettingsSectionCard
            title="Parametros operacionais da empresa"
            subtitle={companyInfo ? `Configurando a empresa ${companyInfo.name}.` : 'Regras do tenant atual.'}
          >
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>Tolerancia de entrega (horas)</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={companySettings.operational.delivery_tolerance_hours}
                  onChange={(event) => handleCompanyChange('operational', 'delivery_tolerance_hours', event.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Janela de coleta (minutos)</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={companySettings.operational.pickup_window_minutes}
                  onChange={(event) => handleCompanyChange('operational', 'pickup_window_minutes', event.target.value)}
                />
              </CCol>
              <CCol md={4} className="d-flex align-items-end">
                <CFormCheck
                  id="auto-block-divergent-financial"
                  label="Bloquear financeiro divergente automaticamente"
                  checked={Boolean(companySettings.operational.auto_block_divergent_financial)}
                  onChange={(event) => handleCompanyChange('operational', 'auto_block_divergent_financial', event.target.checked)}
                />
              </CCol>
            </CRow>
          </SettingsSectionCard>

          <SettingsSectionCard title="Status padrao por modulo" subtitle="Defina status iniciais para novos registros operacionais.">
            <CRow className="g-3">
              <CCol md={3}>
                <CFormLabel>Pedido</CFormLabel>
                <CFormSelect
                  value={companySettings.default_statuses.transport_order_default_status}
                  onChange={(event) => handleCompanyChange('default_statuses', 'transport_order_default_status', event.target.value)}
                >
                  {options.transport_order_statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Carga</CFormLabel>
                <CFormSelect
                  value={companySettings.default_statuses.load_default_status}
                  onChange={(event) => handleCompanyChange('default_statuses', 'load_default_status', event.target.value)}
                >
                  {options.load_statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Agendamento</CFormLabel>
                <CFormSelect
                  value={companySettings.default_statuses.pickup_schedule_default_status}
                  onChange={(event) => handleCompanyChange('default_statuses', 'pickup_schedule_default_status', event.target.value)}
                >
                  {options.pickup_schedule_statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Check-in</CFormLabel>
                <CFormSelect
                  value={companySettings.default_statuses.vehicle_checkin_default_status}
                  onChange={(event) => handleCompanyChange('default_statuses', 'vehicle_checkin_default_status', event.target.value)}
                >
                  {options.vehicle_checkin_statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </SettingsSectionCard>

          <SettingsSectionCard title="Upload e limites por modulo" subtitle="Controle capacidade e politicas do tenant atual.">
            <CRow className="g-3 mb-3">
              <CCol md={4}>
                <CFormLabel>Tamanho maximo upload (MB)</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={companySettings.upload_rules.company_upload_max_file_size_mb}
                  onChange={(event) => handleCompanyChange('upload_rules', 'company_upload_max_file_size_mb', event.target.value)}
                />
              </CCol>
              <CCol md={8}>
                <CFormLabel>Extensoes permitidas</CFormLabel>
                <CFormInput
                  value={companySettings.upload_rules.company_allowed_extensions}
                  onChange={(event) => handleCompanyChange('upload_rules', 'company_allowed_extensions', event.target.value)}
                />
              </CCol>
            </CRow>
            <CRow className="g-3">
              <CCol md={3}>
                <CFormLabel>Limite usuarios</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={companySettings.limits.limite_usuarios}
                  onChange={(event) => handleCompanyChange('limits', 'limite_usuarios', event.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Limite transportadoras</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={companySettings.limits.limite_transportadoras}
                  onChange={(event) => handleCompanyChange('limits', 'limite_transportadoras', event.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Limite veiculos</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={companySettings.limits.limite_veiculos}
                  onChange={(event) => handleCompanyChange('limits', 'limite_veiculos', event.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Limite motoristas</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={companySettings.limits.limite_motoristas}
                  onChange={(event) => handleCompanyChange('limits', 'limite_motoristas', event.target.value)}
                />
              </CCol>
            </CRow>
          </SettingsSectionCard>

          <div className="d-flex justify-content-end">
            <CButton color="primary" onClick={saveCompany} disabled={!capabilities.can_manage_company || !canManageSettings}>
              Salvar configuracoes da empresa
            </CButton>
          </div>
        </>
      ) : null}

      {activeScope === 'catalogs' ? (
        <>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              <h5 className="mb-1">Catalogos operacionais</h5>
              <p className="text-body-secondary mb-0">
                Centralize tipos, status, docas, unidades e parametros reutilizados por toda a operacao.
              </p>
            </div>
            <CButton color="primary" onClick={openCreateCatalogModal} disabled={!canManageSettings}>
              Novo item
            </CButton>
          </div>
          <SettingsCatalogFilters
            filters={catalogFilters}
            options={{ ...catalogOptions, catalogTypes: sortedCatalogTypes }}
            onChange={handleCatalogFilterChange}
            onSearch={handleCatalogSearch}
            onReset={handleCatalogReset}
          />
          {isCatalogLoading ? (
            <CrudLoadingState message="Carregando catalogos..." />
          ) : (
            <>
              <SettingsCatalogTable
                items={catalogItems}
                catalogTypes={sortedCatalogTypes}
                onEdit={openEditCatalogModal}
                onToggleStatus={handleToggleCatalogStatus}
              />
              <CrudPagination
                page={catalogMeta.page}
                pageCount={catalogMeta.pageCount}
                total={catalogMeta.total}
                perPage={catalogMeta.perPage}
                itemLabel="itens"
                onPageChange={(page) => loadCatalogs(page, appliedCatalogFilters)}
              />
            </>
          )}
          <SettingsCatalogForm
            visible={catalogModalVisible}
            item={catalogForm}
            errors={catalogErrors}
            options={{ ...catalogOptions, catalogTypes: sortedCatalogTypes }}
            isSubmitting={isCatalogSubmitting}
            onChange={handleCatalogFormChange}
            onClose={closeCatalogModal}
            onSubmit={submitCatalogForm}
          />
        </>
      ) : null}
    </>
  )
}

export default SettingsPage
