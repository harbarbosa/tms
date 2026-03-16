import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilLocationPin, cilSpeedometer, cilTruck, cilWarning } from '@coreui/icons'

const buildItems = (role) => {
  if (role === 'driver') {
    return [
      { to: '/driver/dashboard', label: 'Portal', icon: cilSpeedometer },
      { to: '/operations/transport-documents', label: 'Viagens', icon: cilTruck },
      { to: '/execution/delivery-tracking', label: 'Tracking', icon: cilLocationPin },
      { to: '/execution/incidents', label: 'Ocorrencias', icon: cilWarning },
      { to: '/execution/proof-of-deliveries', label: 'Entrega', icon: cilCheckCircle },
    ]
  }

  if (role === 'carrier') {
    return [
      { to: '/carrier/dashboard', label: 'Portal', icon: cilSpeedometer },
      { to: '/operations/freight-quotations', label: 'Cotacoes', icon: cilTruck },
      { to: '/operations/transport-documents', label: 'Viagens', icon: cilLocationPin },
      { to: '/execution/trip-documents', label: 'Docs', icon: cilCheckCircle },
      { to: '/control/freight-audits', label: 'Auditoria', icon: cilWarning },
    ]
  }

  return []
}

const MobileOperationsNav = () => {
  const user = useSelector((state) => state.auth.user)
  const items = buildItems(user?.role)

  if (items.length === 0) {
    return null
  }

  return (
    <nav className="tms-mobile-nav d-lg-none">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `tms-mobile-nav__item ${isActive ? 'is-active' : ''}`}
        >
          <CIcon icon={item.icon} size="lg" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default MobileOperationsNav
