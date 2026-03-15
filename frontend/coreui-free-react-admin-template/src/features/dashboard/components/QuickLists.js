import React from 'react'
import { Link } from 'react-router-dom'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'

const QuickLists = ({ lists }) => {
  const cards = [
    {
      title: 'Ultimas ocorrencias',
      items: lists.latest_incidents || [],
      renderItem: (item) => (
        <>
          <div className="fw-semibold">{item.tipo_ocorrencia}</div>
          <div className="small text-body-secondary">{item.numero_ot}</div>
        </>
      ),
      badge: (item) => <CBadge color={item.status === 'aberta' ? 'danger' : 'warning'}>{item.status}</CBadge>,
      to: '/execution/incidents',
    },
    {
      title: 'Ultimas entregas',
      items: lists.latest_deliveries || [],
      renderItem: (item) => (
        <>
          <div className="fw-semibold">{item.numero_ot}</div>
          <div className="small text-body-secondary">{item.nome_recebedor}</div>
        </>
      ),
      badge: (item) => <CBadge color="success">{new Date(item.data_entrega_real).toLocaleDateString('pt-BR')}</CBadge>,
      to: '/execution/proof-of-deliveries',
    },
    {
      title: 'Ultimas ordens de transporte',
      items: lists.latest_transport_documents || [],
      renderItem: (item) => (
        <>
          <div className="fw-semibold">{item.numero_ot}</div>
          <div className="small text-body-secondary">{item.transporter_name}</div>
        </>
      ),
      badge: (item) => <CBadge color="info">{item.status}</CBadge>,
      to: '/operations/transport-documents',
    },
  ]

  return (
    <CRow>
      {cards.map((card) => (
        <CCol lg={4} key={card.title}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{card.title}</span>
              <Link to={card.to} className="small text-decoration-none">
                Ver tudo
              </Link>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                {card.items.length === 0 ? (
                  <CListGroupItem className="px-0 text-body-secondary">Sem registros no periodo.</CListGroupItem>
                ) : (
                  card.items.map((item) => (
                    <CListGroupItem key={item.id} className="px-0 d-flex justify-content-between align-items-start gap-2">
                      <div>{card.renderItem(item)}</div>
                      <div>{card.badge(item)}</div>
                    </CListGroupItem>
                  ))
                )}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

export default QuickLists
