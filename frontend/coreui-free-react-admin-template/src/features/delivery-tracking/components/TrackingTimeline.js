import React from 'react'
import { CBadge, CCard, CCardBody, CCardHeader } from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'

const TrackingTimeline = ({ events }) => {
  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Timeline da viagem</CCardHeader>
      <CCardBody>
        {events.length === 0 ? (
          <div className="text-body-secondary">Nenhum evento registrado ate o momento.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {events.map((event) => (
              <div key={event.id} className="d-flex gap-3 align-items-start">
                <div className="mt-1">
                  <CBadge color="primary" shape="rounded-pill">
                    {new Date(event.event_at).toLocaleDateString('pt-BR')}
                  </CBadge>
                </div>
                <div className="flex-grow-1 border-start ps-3">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <CrudStatusBadge status={event.status} />
                    <small className="text-body-secondary">
                      {new Date(event.event_at).toLocaleString('pt-BR')}
                    </small>
                  </div>
                  <div className="mt-2">{event.observacoes || 'Sem observacoes adicionais.'}</div>
                  {event.attachment_path ? (
                    <small className="text-body-secondary d-block mt-1">
                      Anexo futuro: {event.attachment_path}
                    </small>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TrackingTimeline
