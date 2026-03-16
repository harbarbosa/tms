import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsA,
} from '@coreui/react'
import CrudLoadingState from '../../../components/crud/CrudLoadingState'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'
import driverPortalService from '../services/driverPortalService'

const DriverPortalDashboardPage = () => {
  const dispatch = useDispatch()
  const [data, setData] = useState({ cards: {}, quick_lists: {} })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)

      try {
        const loaded = await driverPortalService.dashboard()
        setData(loaded)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [dispatch])

  const cards = useMemo(
    () => [
      { key: 'active_trips', title: 'Minhas viagens ativas', color: 'primary' },
      { key: 'in_transit', title: 'Eventos em andamento', color: 'info' },
      { key: 'open_incidents', title: 'Ocorrencias abertas', color: 'danger' },
      { key: 'pending_proofs', title: 'Comprovantes pendentes', color: 'warning' },
      { key: 'available_documents', title: 'Documentos disponiveis', color: 'success' },
    ],
    [],
  )

  if (isLoading) {
    return <CrudLoadingState message="Carregando portal do motorista..." />
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-1">Portal do Motorista</h2>
          <div className="text-body-secondary">
            Acompanhe suas viagens, atualize o rastreamento e registre comprovantes de entrega.
          </div>
        </div>
        <div className="tms-mobile-stack-actions">
          <CButton color="primary" className="tms-mobile-submit" as={Link} to="/operations/transport-documents">
            Minhas viagens
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            className="tms-mobile-submit"
            as={Link}
            to="/execution/delivery-tracking"
          >
            Atualizar rastreamento
          </CButton>
        </div>
      </div>

      <CRow className="mb-4">
        {cards.map((card) => (
          <CCol md={6} xl={4} key={card.key}>
            <CWidgetStatsA
              className="mb-4 shadow-sm border-0"
              color={card.color}
              value={<>{data.cards?.[card.key] ?? 0}</>}
              title={card.title}
            />
          </CCol>
        ))}
      </CRow>

      <CRow className="g-4">
        <CCol xl={4}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader>Minhas viagens</CCardHeader>
            <CCardBody>
              {(data.quick_lists?.transport_documents || []).length === 0 ? (
                <div className="text-body-secondary">Nenhuma viagem vinculada ao motorista.</div>
              ) : (
                data.quick_lists.transport_documents.map((item) => (
                  <div key={item.id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{item.numero_ot}</strong>
                      <CrudStatusBadge status={item.status} />
                    </div>
                    <div className="small text-body-secondary">
                      Coleta: {item.data_coleta_prevista || '-'} | Entrega: {item.data_entrega_prevista || '-'}
                    </div>
                    <div className="mt-2 tms-mobile-stack-actions">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        className="tms-mobile-submit"
                        as={Link}
                        to={`/operations/transport-documents/${item.id}`}
                      >
                        Ver detalhes
                      </CButton>
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        className="tms-mobile-submit"
                        as={Link}
                        to={`/execution/delivery-tracking/${item.id}`}
                      >
                        Rastrear
                      </CButton>
                    </div>
                  </div>
                ))
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader>Ocorrencias recentes</CCardHeader>
            <CCardBody>
              {(data.quick_lists?.incidents || []).length === 0 ? (
                <div className="text-body-secondary">Nenhuma ocorrencia recente nas suas viagens.</div>
              ) : (
                data.quick_lists.incidents.map((item) => (
                  <div key={item.id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{item.numero_ot}</strong>
                      <CrudStatusBadge status={item.status} />
                    </div>
                    <div>{item.tipo_ocorrencia}</div>
                    <div className="small text-body-secondary">{item.occurred_at}</div>
                  </div>
                ))
              )}
              <CButton color="warning" variant="outline" className="tms-mobile-submit" as={Link} to="/execution/incidents">
                Ver ocorrencias
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader>Documentos relevantes</CCardHeader>
            <CCardBody>
              {(data.quick_lists?.trip_documents || []).length === 0 ? (
                <div className="text-body-secondary">Nenhum documento relevante disponivel para consulta.</div>
              ) : (
                data.quick_lists.trip_documents.map((item) => (
                  <div key={item.id} className="mb-3 pb-3 border-bottom">
                    <strong>{item.numero_ot}</strong>
                    <div>{item.tipo_documento}</div>
                    <div className="small text-body-secondary">{item.nome_arquivo_original}</div>
                  </div>
                ))
              )}
              <CButton color="success" variant="outline" className="tms-mobile-submit" as={Link} to="/execution/trip-documents">
                Ver documentos
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CAlert color="light" className="mt-4 border">
        O portal do motorista mostra apenas entregas vinculadas ao seu cadastro e foi mantido simples para futura adaptacao PWA/mobile.
      </CAlert>
    </>
  )
}

export default DriverPortalDashboardPage
