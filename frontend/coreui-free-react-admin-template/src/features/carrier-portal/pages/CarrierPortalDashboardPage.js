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
import carrierPortalService from '../services/carrierPortalService'

const toDateInput = (date) => date.toISOString().slice(0, 10)

const getCurrentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start_date: toDateInput(start), end_date: toDateInput(now) }
}

const CarrierPortalDashboardPage = () => {
  const dispatch = useDispatch()
  const [filters] = useState(getCurrentMonthRange())
  const [data, setData] = useState({ cards: {}, quick_lists: {} })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)

      try {
        const loaded = await carrierPortalService.dashboard(filters)
        setData(loaded)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [dispatch, filters])

  const cards = useMemo(
    () => [
      { key: 'received_quotations', title: 'Cotacoes recebidas', color: 'primary' },
      { key: 'responded_proposals', title: 'Propostas respondidas', color: 'info' },
      { key: 'active_trips', title: 'OTs ativas', color: 'warning' },
      { key: 'open_incidents', title: 'Ocorrencias abertas', color: 'danger' },
      { key: 'pending_documents', title: 'Documentos pendentes', color: 'dark' },
      { key: 'financial_pending', title: 'Financeiro pendente', color: 'success' },
    ],
    [],
  )

  if (isLoading) {
    return <CrudLoadingState message="Carregando portal da transportadora..." />
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Portal da Transportadora</h2>
          <div className="text-body-secondary">
            Visao dedicada para cotacoes, viagens, documentos e acompanhamento operacional.
          </div>
        </div>
        <div className="d-flex gap-2">
          <CButton color="primary" as={Link} to="/operations/freight-quotations">
            Ver cotacoes
          </CButton>
          <CButton color="secondary" variant="outline" as={Link} to="/operations/transport-documents">
            Ver viagens
          </CButton>
        </div>
      </div>

      <CRow className="mb-4">
        {cards.map((card) => (
          <CCol sm={6} xl={4} key={card.key}>
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
            <CCardHeader>Ultimas cotacoes</CCardHeader>
            <CCardBody>
              {(data.quick_lists?.quotations || []).length === 0 ? (
                <div className="text-body-secondary">Nenhuma cotacao recebida no periodo.</div>
              ) : (
                data.quick_lists.quotations.map((item) => (
                  <div key={`${item.quotation_id}-${item.id}`} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>Cotacao #{item.quotation_id}</strong>
                      <CrudStatusBadge status={item.status_resposta} />
                    </div>
                    <div className="small text-body-secondary">Limite: {item.data_limite_resposta || '-'}</div>
                    <div className="mt-2">
                      <CButton size="sm" color="primary" variant="outline" as={Link} to={`/operations/freight-quotations/${item.quotation_id}`}>
                        Abrir cotacao
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
            <CCardHeader>Ultimas viagens</CCardHeader>
            <CCardBody>
              {(data.quick_lists?.transport_documents || []).length === 0 ? (
                <div className="text-body-secondary">Nenhuma viagem vinculada encontrada.</div>
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
                    <div className="mt-2">
                      <CButton size="sm" color="secondary" variant="outline" as={Link} to={`/operations/transport-documents/${item.id}`}>
                        Abrir OT
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
                <div className="text-body-secondary">Nenhuma ocorrencia recente vinculada as suas viagens.</div>
              ) : (
                data.quick_lists.incidents.map((item) => (
                  <div key={item.id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{item.numero_ot}</strong>
                      <CrudStatusBadge status={item.status} />
                    </div>
                    <div>{item.tipo_ocorrencia}</div>
                    <div className="small text-body-secondary">{item.occurred_at}</div>
                    <div className="mt-2">
                      <CButton size="sm" color="danger" variant="outline" as={Link} to="/execution/delivery-tracking">
                        Ver rastreamento
                      </CButton>
                    </div>
                  </div>
                ))
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CAlert color="light" className="mt-4 border">
        O portal mostra apenas dados vinculados a transportadora logada e respeita as permissoes recebidas da API.
      </CAlert>
    </>
  )
}

export default CarrierPortalDashboardPage
