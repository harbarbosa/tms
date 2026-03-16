import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'
import vehicleCheckinService from '../services/vehicleCheckinService'

const VehicleCheckinDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [checkin, setCheckin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [isRegisteringEntry, setIsRegisteringEntry] = useState(false)
  const [isRegisteringExit, setIsRegisteringExit] = useState(false)

  const loadCheckin = async () => {
    try {
      const data = await vehicleCheckinService.findById(id)
      setCheckin(data)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCheckin()
  }, [id])

  const handleRegisterEntry = async () => {
    setIsRegisteringEntry(true)

    try {
      await vehicleCheckinService.registerEntry(id)
      setFeedback('Entrada registrada com sucesso.')
      await loadCheckin()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsRegisteringEntry(false)
    }
  }

  const handleRegisterExit = async () => {
    setIsRegisteringExit(true)

    try {
      await vehicleCheckinService.registerExit(id)
      setFeedback('Saida registrada com sucesso.')
      await loadCheckin()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsRegisteringExit(false)
    }
  }

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes do check-in...</CAlert>
  }

  if (!checkin) {
    return <CAlert color="warning">Check-in nao encontrado.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/vehicle-checkins">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/execution/vehicle-checkins/${checkin.id}/edit`}>
          Editar check-in
        </CButton>
        {checkin.transport_document_id ? (
          <CButton color="dark" variant="outline" as={Link} to={`/operations/transport-documents/${checkin.transport_document_id}`}>
            Ver OT
          </CButton>
        ) : null}
        {checkin.pickup_schedule_id ? (
          <CButton color="secondary" variant="outline" as={Link} to={`/execution/pickup-schedules/${checkin.pickup_schedule_id}`}>
            Ver agendamento
          </CButton>
        ) : null}
        {!checkin.horario_entrada && checkin.status !== 'recusado' ? (
          <CButton color="primary" onClick={handleRegisterEntry} disabled={isRegisteringEntry}>
            {isRegisteringEntry ? 'Registrando entrada...' : 'Registrar entrada'}
          </CButton>
        ) : null}
        {!checkin.horario_saida && checkin.status !== 'recusado' ? (
          <CButton color="success" onClick={handleRegisterExit} disabled={isRegisteringExit}>
            {isRegisteringExit ? 'Registrando saida...' : 'Registrar saida'}
          </CButton>
        ) : null}
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {checkin.operational_flags?.delayed ? (
        <CAlert color="warning">Chegada posterior a janela planejada do agendamento.</CAlert>
      ) : null}
      {checkin.operational_flags?.divergencia ? (
        <CAlert color="danger">Divergencia operacional registrada para este check-in.</CAlert>
      ) : null}
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Check-in #{checkin.id}</span>
              <CrudStatusBadge status={checkin.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Transportadora</strong>
                  <div>{checkin.transporter_name}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Motorista</strong>
                  <div>{checkin.driver_name || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Veiculo</strong>
                  <div>{checkin.vehicle_plate || checkin.placa || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Doca</strong>
                  <div>{checkin.doca || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Horario de chegada</strong>
                  <div>{checkin.horario_chegada || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Horario de entrada</strong>
                  <div>{checkin.horario_entrada || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Horario de saida</strong>
                  <div>{checkin.horario_saida || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Placa</strong>
                  <div>{checkin.placa || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>OT</strong>
                  <div>{checkin.numero_ot || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{checkin.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Historico operacional</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Agendamento</span>
                  <span>{checkin.pickup_schedule_id ? `#${checkin.pickup_schedule_id}` : '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Unidade</span>
                  <span>{checkin.unidade_origem || '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Janela prevista</span>
                  <span>
                    {checkin.data_agendada && checkin.hora_inicio
                      ? `${checkin.data_agendada} ${checkin.hora_inicio}`
                      : '-'}
                  </span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Atraso</span>
                  <span>{checkin.operational_flags?.delayed ? 'Sim' : 'Nao'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Divergencia</span>
                  <span>{checkin.operational_flags?.divergencia ? 'Sim' : 'Nao'}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default VehicleCheckinDetailsPage
