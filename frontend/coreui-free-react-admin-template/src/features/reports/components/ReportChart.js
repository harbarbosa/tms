import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { CChartBar, CChartDoughnut, CChartLine } from '@coreui/react-chartjs'

const chartComponentMap = {
  bar: CChartBar,
  line: CChartLine,
  doughnut: CChartDoughnut,
}

const baseColors = ['#321fdb', '#39f', '#2eb85c', '#f9b115', '#e55353', '#3399ff', '#d63384']

const ReportChart = ({ chart }) => {
  if (!chart?.labels?.length || !chart?.datasets?.length) {
    return null
  }

  const ChartComponent = chartComponentMap[chart.type] || CChartBar
  const datasets = chart.datasets.map((dataset, index) => ({
    backgroundColor: dataset.backgroundColor || baseColors[index % baseColors.length],
    borderColor: dataset.borderColor || baseColors[index % baseColors.length],
    fill: chart.type === 'line' ? false : true,
    tension: chart.type === 'line' ? 0.35 : undefined,
    ...dataset,
  }))

  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardHeader>{chart.title || 'Grafico'}</CCardHeader>
      <CCardBody>
        <ChartComponent
          data={{
            labels: chart.labels,
            datasets,
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
              },
            },
            scales: chart.type === 'doughnut' ? undefined : { y: { beginAtZero: true } },
          }}
          style={{ minHeight: 320 }}
        />
      </CCardBody>
    </CCard>
  )
}

export default ReportChart
