import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FreightProposalComparison = ({
  proposals,
  quotationStatus,
  approvingId,
  onApprove,
  canApprove = true,
}) => {
  const canApproveQuotation =
    canApprove &&
    quotationStatus !== 'aprovada' &&
    quotationStatus !== 'cancelada' &&
    quotationStatus !== 'expirada'

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Comparacao de propostas</CCardHeader>
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Transportadora</CTableHeaderCell>
              <CTableHeaderCell>Valor frete</CTableHeaderCell>
              <CTableHeaderCell>Prazo</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Observacoes</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acao</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {proposals.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">
                  Nenhuma proposta cadastrada para esta cotacao.
                </CTableDataCell>
              </CTableRow>
            ) : (
              proposals.map((proposal) => (
                <CTableRow key={proposal.id}>
                  <CTableDataCell>{proposal.transporter_name}</CTableDataCell>
                  <CTableDataCell>{proposal.valor_frete ? formatCurrency(proposal.valor_frete) : '-'}</CTableDataCell>
                  <CTableDataCell>
                    {proposal.prazo_entrega_dias ? `${proposal.prazo_entrega_dias} dias` : '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={proposal.status_resposta} />
                  </CTableDataCell>
                  <CTableDataCell>{proposal.observacoes || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton
                      color="success"
                      variant={proposal.status_resposta === 'aprovada' ? undefined : 'outline'}
                      size="sm"
                      disabled={!canApproveQuotation || approvingId === proposal.id}
                      onClick={() => onApprove(proposal.id)}
                    >
                      {approvingId === proposal.id ? 'Aprovando...' : proposal.status_resposta === 'aprovada' ? 'Aprovada' : 'Aprovar'}
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default FreightProposalComparison
