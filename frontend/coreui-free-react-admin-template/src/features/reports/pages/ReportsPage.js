import React, { useEffect, useMemo, useState } from 'react'
import { CAlert, CNav, CNavItem, CNavLink } from '@coreui/react'
import { useDispatch } from 'react-redux'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import ReportCatalogCards from '../components/ReportCatalogCards'
import ReportChart from '../components/ReportChart'
import ReportFilters from '../components/ReportFilters'
import ReportTable from '../components/ReportTable'
import reportService from '../services/reportService'

const defaultFilters = {
  start_date: '',
  end_date: '',
  company_id: '',
  transporter_id: '',
  status: '',
  perPage: '10',
}

const statusMap = {
  'orders-by-status': 'orders',
  'loads-by-period': 'loads',
  'transport-documents-by-status': 'transport_documents',
  'delivery-performance': 'deliveries',
  'incidents-by-type': 'incidents',
  'audits-by-status': 'audits',
  'pending-proofs': 'pending_proofs',
  'freight-by-transporter': 'financial',
  'freight-by-route': 'financial',
  'freight-by-client': 'financial',
  'freight-divergence-by-period': 'financial',
  'top-incident-carriers': 'performance',
  'best-performance-carriers': 'performance',
  'average-delivery-time': 'performance',
  'sla-ranking-by-transporter': 'performance',
}

const sections = [
  { key: 'operational', label: 'Operacionais' },
  { key: 'financial', label: 'Financeiros' },
  { key: 'performance', label: 'Performance' },
]

const ReportsPage = () => {
  const dispatch = useDispatch()
  const [catalog, setCatalog] = useState([])
  const [options, setOptions] = useState({ companies: [], transporters: [], statuses: {} })
  const [activeSection, setActiveSection] = useState('operational')
  const [activeReport, setActiveReport] = useState('orders-by-status')
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [columns, setColumns] = useState([])
  const [items, setItems] = useState([])
  const [chart, setChart] = useState(null)
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const activeStatusOptions = useMemo(
    () => options.statuses?.[statusMap[activeReport]] || [],
    [activeReport, options.statuses],
  )

  const visibleReports = useMemo(
    () =>
      catalog
        .filter((report) => report.section === activeSection)
        .map((report) => ({
          ...report,
          sectionLabel: sections.find((section) => section.key === report.section)?.label,
        })),
    [activeSection, catalog],
  )

  const loadOptions = async () => {
    try {
      const response = await reportService.options()
      setCatalog(response.reports || [])
      setOptions({
        companies: response.companies || [],
        transporters: response.transporters || [],
        statuses: response.statuses || {},
      })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  const loadReport = async (page = 1, currentFilters = appliedFilters, currentReport = activeReport) => {
    setIsLoading(true)
    try {
      const response = await reportService.fetch(currentReport, { ...currentFilters, page, perPage: currentFilters.perPage })
      setColumns(response.columns || [])
      setItems(response.items || [])
      setChart(response.chart || null)
      setMeta(response.meta || null)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOptions()
  }, [])

  useEffect(() => {
    const firstReport = catalog.find((report) => report.section === activeSection)

    if (firstReport && firstReport.key !== activeReport) {
      setActiveReport(firstReport.key)
    }
  }, [activeReport, activeSection, catalog])

  useEffect(() => {
    loadReport(1, appliedFilters, activeReport)
  }, [activeReport, appliedFilters])

  return (
    <>
      <CrudPageHeader
        title="Relatorios Operacionais"
        description="Consulte indicadores operacionais, financeiros e de performance com filtros globais, graficos e exportacao."
      />
      <CNav variant="tabs" className="mb-4">
        {sections.map((section) => (
          <CNavItem key={section.key}>
            <CNavLink
              active={activeSection === section.key}
              onClick={() => {
                setActiveSection(section.key)
                setChart(null)
              }}
              role="button"
            >
              {section.label}
            </CNavLink>
          </CNavItem>
        ))}
      </CNav>
      <ReportCatalogCards
        reports={visibleReports}
        activeReport={activeReport}
        onSelect={(reportKey) => {
          setActiveReport(reportKey)
          setItems([])
          setColumns([])
          setChart(null)
        }}
      />
      <ReportFilters
        filters={filters}
        companies={options.companies}
        transporters={options.transporters}
        statusOptions={activeStatusOptions}
        onChange={(event) => {
          const { name, value } = event.target
          setFilters((current) => ({ ...current, [name]: value }))
        }}
        onSearch={() => setAppliedFilters(filters)}
        onReset={() => {
          setFilters(defaultFilters)
          setAppliedFilters(defaultFilters)
        }}
        onExport={async () => {
          try {
            await reportService.exportCsv(activeReport, appliedFilters)
          } catch (error) {
            dispatch({ type: 'app/setError', payload: error.message })
          }
        }}
      />
      {isLoading ? (
        <CAlert color="info">Carregando relatorio...</CAlert>
      ) : (
        <>
          <ReportChart chart={chart} />
          <ReportTable columns={columns} items={items} />
          {meta ? <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadReport(page, appliedFilters, activeReport)} /> : null}
        </>
      )}
    </>
  )
}

export default ReportsPage
