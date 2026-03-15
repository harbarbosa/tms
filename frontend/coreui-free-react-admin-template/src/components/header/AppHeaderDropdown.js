import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import useAuth from '../../hooks/useAuth'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    logout().finally(() => {
      navigate('/login', { replace: true })
    })
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {user?.companyName || 'Conta atual'}
        </CDropdownHeader>
        <CDropdownItem as="button" type="button">
          <CIcon icon={cilUser} className="me-2" />
          {user?.name || 'Usuario autenticado'}
        </CDropdownItem>
        <CDropdownItem as="button" type="button">
          <CIcon icon={cilSettings} className="me-2" />
          {user?.role_name || user?.role || 'Perfil'}
        </CDropdownItem>
        <CDropdownItem as="button" type="button" onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Sair
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
