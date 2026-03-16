import React from 'react'
import { CBadge, CCard, CCardBody, CCardHeader, CListGroup, CListGroupItem } from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'

const eventMap = {
  criado: { color: 'secondary', label: 'Criado' },
  enviado_para_analise: { color: 'warning', label: 'Enviado para analise' },
  aprovado: { color: 'success', label: 'Aprovado' },
  bloqueado: { color: 'danger', label: 'Bloqueado' },
  recusado: { color: 'danger', label: 'Recusado' },
  pago: { color: 'success', label: 'Pago' },
  cancelado: { color: 'dark', label: 'Cancelado' },
  liberado: { color: 'info', label: 'Liberado' },
}

const FinancialTimeline = ({ history }) => (
  <CCard className="shadow-sm border-0">
    <CCardHeader>Historico financeiro</CCardHeader>
    <CCardBody>
      <CListGroup flush>
        {history.length === 0 ? (
          <CListGroupItem className="px-0 text-body-secondary">Nenhum evento financeiro registrado.</CListGroupItem>
        ) : (
          history.map((item) => {
            const event = eventMap[item.evento] || { color: 'secondary', label: item.evento }

            return (
              <CListGroupItem key={item.id} className="px-0">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <CBadge color={event.color}>{event.label}</CBadge>
                      {item.status_novo ? <CrudStatusBadge status={item.status_novo} /> : null}
                    </div>
                    <div className="small text-body-secondary">
                      {item.responsavel || 'Sistema'} • {item.created_at || '-'}
                    </div>
                    {item.motivo ? <div className="mt-2">{item.motivo}</div> : null}
                  </div>
                  <div className="small text-body-secondary text-end">
                    {item.status_anterior ? <div>De: {item.status_anterior}</div> : null}
                    {item.status_novo ? <div>Para: {item.status_novo}</div> : null}
                  </div>
                </div>
              </CListGroupItem>
            )
          })
        )}
      </CListGroup>
    </CCardBody>
  </CCard>
)

export default FinancialTimeline
