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
import Can from '../../../components/guards/Can'
import deliveryTrackingService from '../services/deliveryTrackingService'
import incidentService from '../../incidents/services/incidentService'
import TrackingEventForm from '../components/TrackingEventForm'
import TrackingTimeline from '../components/TrackingTimeline'
import { validateTrackingEventForm } from '../utils/deliveryTrackingValidation'

const toLocalDateTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const pad = (input) => String(input).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toApiDateTime = (value) => (value ? `${value.replace('T', ' ')}:00` : '')

const initialEventValues = {
  status: 'aguardando_coleta',
  event_at: '',
  observacoes: '',
  attachment_path: '',
}

const DeliveryTrackingDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [tracking, setTracking] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [eventValues, setEventValues] = useState(initialEventValues)
  const [eventErrors, setEventErrors] = useState({})
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false)

  const loadTracking = async () => {
    try {
      const data = await deliveryTrackingService.findById(id)
      setTracking(data)
      setEventValues((current) => ({
        ...current,
        status: data.tracking_status || 'aguardando_coleta',
        event_at: current.event_at || toLocalDateTime(new Date().toISOString()),
      }))
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTracking()
  }, [id])

  const handleSubmitEvent = async (event) => {
    event.preventDefault()
    const payload = {
      ...eventValues,
      event_at: toApiDateTime(eventValues.event_at),
    }
    const validationErrors = validateTrackingEventForm(payload)
    setEventErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmittingEvent(true)

    try {
      await deliveryTrackingService.createEvent(id, payload)
      setFeedback('Evento de rastreamento registrado com sucesso.')
      setEventValues((current) => ({
        ...current,
        observacoes: '',
        attachment_path: '',
      }))
      await loadTracking()
    } catch (error) {
      if (error.data?.errors) {
        setEventErrors(error.data.errors)
      }
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmittingEvent(false)
    }
  }

  if (isLoading) {
    return <CAlert color="info">Carregando timeline da viagem...</CAlert>
  }

  if (!tracking) {
    return <CAlert color="warning">Rastreamento nao encontrado.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/delivery-tracking">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/operations/transport-documents/${tracking.id}`}>
          Ver OT
        </CButton>
        <Can permission="incidents.create">
          <CButton color="warning" variant="outline" as={Link} to={`/execution/incidents/new?transport_document_id=${tracking.id}`}>
            Nova ocorrencia
          </CButton>
        </Can>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{tracking.numero_ot}</span>
              <CrudStatusBadge status={tracking.tracking_status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Carga</strong>
                  <div>{tracking.codigo_carga || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Pedido</strong>
                  <div>{tracking.numero_pedido || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Transportadora</strong>
                  <div>{tracking.transporter_name}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Motorista</strong>
                  <div>{tracking.driver_name || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Veiculo</strong>
                  <div>{tracking.vehicle_plate || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Status OT</strong>
                  <div><CrudStatusBadge status={tracking.status} /></div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <TrackingTimeline events={tracking.events || []} />
        </CCol>
        <CCol lg={4}>
          <Can permission="delivery_tracking.update">
            <TrackingEventForm
              values={eventValues}
              errors={eventErrors}
              isSubmitting={isSubmittingEvent}
              onChange={(event) => {
                const { name, value } = event.target
                setEventValues((current) => ({ ...current, [name]: value }))
                setEventErrors((current) => ({ ...current, [name]: undefined }))
              }}
              onSubmit={handleSubmitEvent}
            />
          </Can>
          <CCard className="mt-4 shadow-sm border-0">
            <CCardHeader>Ocorrencias da viagem</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                {(tracking.incidents || []).length === 0 ? (
                  <CListGroupItem className="px-0 text-body-secondary">
                    Nenhuma ocorrencia registrada.
                  </CListGroupItem>
                ) : (
                  tracking.incidents.map((incident) => (
                    <CListGroupItem key={incident.id} className="px-0">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <strong>{incident.tipo_ocorrencia}</strong>
                        <CrudStatusBadge status={incident.status} />
                      </div>
                      <div className="small text-body-secondary mt-1">
                        {new Date(incident.occurred_at).toLocaleString('pt-BR')}
                      </div>
                      <div className="mt-2">{incident.observacoes || '-'}</div>
                    </CListGroupItem>
                  ))
                )}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default DeliveryTrackingDetailsPage
