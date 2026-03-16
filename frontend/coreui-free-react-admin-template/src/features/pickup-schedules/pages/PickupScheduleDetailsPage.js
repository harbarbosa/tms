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
import pickupScheduleService from '../services/pickupScheduleService'

const PickupScheduleDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [schedule, setSchedule] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await pickupScheduleService.findById(id)
        setSchedule(data)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedule()
  }, [dispatch, id])

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes do agendamento...</CAlert>
  }

  if (!schedule) {
    return <CAlert color="warning">Agendamento nao encontrado.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/pickup-schedules">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/execution/pickup-schedules/${schedule.id}/edit`}>
          Editar agendamento
        </CButton>
        {schedule.transport_document_id ? (
          <CButton color="dark" variant="outline" as={Link} to={`/operations/transport-documents/${schedule.transport_document_id}`}>
            Ver OT
          </CButton>
        ) : null}
        <CButton color="primary" variant="outline" as={Link} to={`/execution/vehicle-checkins/new?pickup_schedule_id=${schedule.id}`}>
          Iniciar check-in
        </CButton>
      </div>
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Agendamento #{schedule.id}</span>
              <CrudStatusBadge status={schedule.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Data</strong>
                  <div>{schedule.data_agendada}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Janela</strong>
                  <div>{schedule.hora_inicio} - {schedule.hora_fim}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Doca</strong>
                  <div>{schedule.doca || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Transportadora</strong>
                  <div>{schedule.transporter_name}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Responsavel</strong>
                  <div>{schedule.responsavel_agendamento || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Unidade de origem</strong>
                  <div>{schedule.unidade_origem}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Janela de atendimento</strong>
                  <div>{schedule.janela_atendimento || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{schedule.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Contexto operacional</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Ordem de transporte</span>
                  <span>{schedule.numero_ot || '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Status da OT</span>
                  <span>{schedule.ordem_status || '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Check-in preparado</span>
                  <span>{schedule.next_modules?.checkin ? 'Sim' : 'Nao'}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default PickupScheduleDetailsPage
