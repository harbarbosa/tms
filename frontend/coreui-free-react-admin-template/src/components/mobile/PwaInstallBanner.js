import React, { useEffect, useState } from 'react'
import { CButton, CCard, CCardBody } from '@coreui/react'

const PwaInstallBanner = () => {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

    if (standalone) {
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (!installPrompt || isInstalled || isDismissed) {
    return null
  }

  const handleInstall = async () => {
    installPrompt.prompt()
    await installPrompt.userChoice.catch(() => null)
    setInstallPrompt(null)
  }

  return (
    <CCard className="tms-install-banner d-lg-none shadow-sm border-0">
      <CCardBody className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <strong className="d-block">Instalar TMS no celular</strong>
          <small className="text-body-secondary">
            Acesso rapido, experiencia mais fluida e preparada para operacao em campo.
          </small>
        </div>
        <div className="d-flex gap-2 flex-shrink-0">
          <CButton color="light" size="sm" onClick={() => setIsDismissed(true)}>
            Agora nao
          </CButton>
          <CButton color="primary" size="sm" onClick={handleInstall}>
            Instalar
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default PwaInstallBanner
