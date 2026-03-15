import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBuilding,
  cilChartPie,
  cilClipboard,
  cilDollar,
  cilLockLocked,
  cilSettings,
  cilSpeedometer,
  cilTruck,
  cilWarning,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const navigation = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    permission: 'dashboard.view',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Administracao',
  },
  {
    component: CNavGroup,
    name: 'Controle de acesso',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Empresas', to: '/admin/companies', permission: 'companies.view' },
      { component: CNavItem, name: 'Usuarios', to: '/admin/users', permission: 'users.view' },
      { component: CNavItem, name: 'Perfis e permissoes', to: '/admin/roles', permission: 'roles.view' },
    ],
  },
  {
    component: CNavTitle,
    name: 'Cadastros',
  },
  {
    component: CNavGroup,
    name: 'Parceiros e recursos',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Transportadoras', to: '/registry/carriers', permission: 'carriers.view' },
      { component: CNavItem, name: 'Motoristas', to: '/registry/drivers', permission: 'drivers.view' },
      { component: CNavItem, name: 'Veiculos', to: '/registry/vehicles', permission: 'vehicles.view' },
    ],
  },
  {
    component: CNavTitle,
    name: 'Operacao',
  },
  {
    component: CNavGroup,
    name: 'Planejamento',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Pedidos de transporte', to: '/operations/transport-orders', permission: 'transport_orders.view' },
      { component: CNavItem, name: 'Cargas', to: '/operations/loads', permission: 'loads.view' },
      { component: CNavItem, name: 'Cotacao de frete', to: '/operations/freight-quotations', permission: 'freight_quotations.view' },
      { component: CNavItem, name: 'Ordem de transporte', to: '/operations/transport-documents', permission: 'transport_documents.view' },
    ],
  },
  {
    component: CNavGroup,
    name: 'Execucao',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Rastreamento de entrega', to: '/execution/delivery-tracking', permission: 'delivery_tracking.view' },
      { component: CNavItem, name: 'Ocorrencias', to: '/execution/incidents', permission: 'incidents.view' },
      { component: CNavItem, name: 'Documentos da viagem', to: '/execution/trip-documents', permission: 'trip_documents.view' },
      { component: CNavItem, name: 'Comprovante de entrega', to: '/execution/proof-of-deliveries', permission: 'proof_of_deliveries.view' },
    ],
  },
  {
    component: CNavTitle,
    name: 'Controle',
  },
  {
    component: CNavItem,
    name: 'Auditoria de frete',
    to: '/control/freight-audits',
    permission: 'freight_audits.view',
    icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Financeiro',
    to: '/financial',
    permission: 'financial.view',
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
    placeholder: true,
  },
  {
    component: CNavItem,
    name: 'Relatorios',
    to: '/reports',
    permission: 'reports.view',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    placeholder: true,
  },
  {
    component: CNavTitle,
    name: 'Sistema',
  },
  {
    component: CNavItem,
    name: 'Configuracoes',
    to: '/settings',
    permission: 'settings.view',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    placeholder: true,
  },
]

const filterNavigation = (items, permissions = []) =>
  items.reduce((accumulator, item) => {
    if (item.component === CNavTitle) {
      accumulator.push(item)
      return accumulator
    }

    if (item.items) {
      const filteredItems = filterNavigation(item.items, permissions)

      if (filteredItems.length > 0) {
        accumulator.push({
          ...item,
          items: filteredItems,
        })
      }

      return accumulator
    }

    if (item.placeholder) {
      return accumulator
    }

    if (!item.permission || permissions.includes(item.permission)) {
      accumulator.push(item)
    }

    return accumulator
  }, [])

const cleanupTitles = (items) => {
  const cleaned = []

  items.forEach((item, index) => {
    if (item.component !== CNavTitle) {
      cleaned.push(item)
      return
    }

    const nextTitleIndex = items.findIndex(
      (candidate, candidateIndex) => candidateIndex > index && candidate.component === CNavTitle,
    )

    const endIndex = nextTitleIndex === -1 ? items.length : nextTitleIndex
    const sectionItems = items.slice(index + 1, endIndex).filter((candidate) => candidate.component !== CNavTitle)

    if (sectionItems.length > 0) {
      cleaned.push(item)
    }
  })

  return cleaned
}

const buildNavigation = (user) => cleanupTitles(filterNavigation(navigation, user?.permissions || []))

export default buildNavigation
