import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'
import { CChartBar, CChartDoughnut, CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { useDispatch } from 'react-redux'
import DashboardFilters from '../components/DashboardFilters'
import KpiCards from '../components/KpiCards'
import QuickLists from '../components/QuickLists'
import dashboardService from '../services/dashboardService'

const getCurrentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const toDateInput = (date) => date.toISOString().slice(0, 10)

  return {
    start_date: toDateInput(start),
    end_date: toDateInput(now),
  }
}

const DashboardPage = () => {
  const dispatch = useDispatch()
  const [filters, setFilters] = useState(getCurrentMonthRange())
  const [appliedFilters, setAppliedFilters] = useState(getCurrentMonthRange())
  const [summary, setSummary] = useState({ cards: {} })
  const [charts, setCharts] = useState({
    orders_by_status: { labels: [], values: [] },
    deliveries_by_period: { labels: [], values: [] },
    freights_by_carrier: { labels: [], values: [] },
  })
  const [quickLists, setQuickLists] = useState({
    latest_incidents: [],
    latest_deliveries: [],
    latest_transport_documents: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)

      try {
        const [loadedSummary, loadedCharts, loadedQuickLists] = await Promise.all([
          dashboardService.summary(appliedFilters),
          dashboardService.charts(appliedFilters),
          dashboardService.quickLists(appliedFilters),
        ])

        setSummary(loadedSummary)
        setCharts(loadedCharts)
        setQuickLists(loadedQuickLists)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [appliedFilters, dispatch])

  const ordersChartData = useMemo(
    () => ({
      labels: charts.orders_by_status?.labels || [],
      datasets: [
        {
          backgroundColor: [
            getStyle('--cui-primary'),
            getStyle('--cui-info'),
            getStyle('--cui-warning'),
            getStyle('--cui-success'),
            getStyle('--cui-danger'),
            '#6c757d',
          ],
          data: charts.orders_by_status?.values || [],
        },
      ],
    }),
    [charts.orders_by_status],
  )

  const deliveriesChartData = useMemo(
    () => ({
      labels: charts.deliveries_by_period?.labels || [],
      datasets: [
        {
          label: 'Entregas',
          backgroundColor: `rgba(${getStyle('--cui-success-rgb')}, .12)`,
          borderColor: getStyle('--cui-success'),
          pointHoverBackgroundColor: getStyle('--cui-success'),
          borderWidth: 2,
          data: charts.deliveries_by_period?.values || [],
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [charts.deliveries_by_period],
  )

  const freightsChartData = useMemo(
    () => ({
      labels: charts.freights_by_carrier?.labels || [],
      datasets: [
        {
          label: 'Fretes',
          backgroundColor: getStyle('--cui-info'),
          data: charts.freights_by_carrier?.values || [],
        },
      ],
    }),
    [charts.freights_by_carrier],
  )

  return (
    <>
      <DashboardFilters
        filters={filters}
        onChange={(event) => {
          const { name, value } = event.target
          setFilters((current) => ({ ...current, [name]: value }))
        }}
        onApply={() => setAppliedFilters(filters)}
        onCurrentMonth={() => {
          const range = getCurrentMonthRange()
          setFilters(range)
          setAppliedFilters(range)
        }}
      />

      {isLoading ? <CAlert color="info">Carregando indicadores do dashboard...</CAlert> : null}

      <CRow className="mb-2">{!isLoading ? <KpiCards cards={summary.cards} /> : null}</CRow>

      <CRow>
        <CCol xl={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Pedidos por status</CCardHeader>
            <CCardBody style={{ minHeight: 320 }}>
              {charts.orders_by_status?.values?.length ? (
                <CChartDoughnut data={ordersChartData} />
              ) : (
                <div className="text-body-secondary">Sem dados no periodo selecionado.</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Entregas por periodo</CCardHeader>
            <CCardBody style={{ minHeight: 320 }}>
              {charts.deliveries_by_period?.values?.length ? (
                <CChartLine
                  data={deliveriesChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { color: getStyle('--cui-border-color-translucent') },
                        ticks: { color: getStyle('--cui-body-color') },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: getStyle('--cui-border-color-translucent') },
                        ticks: { color: getStyle('--cui-body-color') },
                      },
                    },
                  }}
                  style={{ height: '260px' }}
                />
              ) : (
                <div className="text-body-secondary">Sem entregas no periodo selecionado.</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Fretes por transportadora</CCardHeader>
            <CCardBody style={{ minHeight: 320 }}>
              {charts.freights_by_carrier?.values?.length ? (
                <CChartBar
                  data={freightsChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: getStyle('--cui-body-color') },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: getStyle('--cui-border-color-translucent') },
                        ticks: { color: getStyle('--cui-body-color') },
                      },
                    },
                  }}
                  style={{ height: '260px' }}
                />
              ) : (
                <div className="text-body-secondary">Sem fretes contratados no periodo.</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <QuickLists lists={quickLists} />
    </>
  )
}

export default DashboardPage
