<?php

namespace App\Controllers\Api\V1;

use App\Models\FreightFinancialEntryModel;
use App\Models\FreightQuoteProposalModel;
use App\Models\FreightQuotationModel;
use App\Models\IncidentModel;
use App\Models\TransportDocumentModel;
use App\Models\TripDocumentModel;

class CarrierPortalController extends BaseApiController
{
    public function __construct(
        private readonly FreightQuotationModel $quotations = new FreightQuotationModel(),
        private readonly FreightQuoteProposalModel $proposals = new FreightQuoteProposalModel(),
        private readonly TransportDocumentModel $documents = new TransportDocumentModel(),
        private readonly IncidentModel $incidents = new IncidentModel(),
        private readonly TripDocumentModel $tripDocuments = new TripDocumentModel(),
        private readonly FreightFinancialEntryModel $financialEntries = new FreightFinancialEntryModel(),
    ) {
    }

    public function dashboard()
    {
        $this->requirePermission('freight_quotations.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $carrierId = (int) ($this->getCurrentScope()['carrier_id'] ?? 0);

        if ($this->getCurrentRole() !== 'carrier' || $carrierId <= 0) {
            return $this->respondError('Portal da transportadora indisponivel para o perfil atual.', null, 403);
        }

        [$startDate, $endDate] = $this->resolvePeriod();
        $documentIds = $this->documents
            ->select('id')
            ->where('company_id', $companyId)
            ->where('transporter_id', $carrierId)
            ->findColumn('id') ?: [];

        $pendingQuotationCount = $this->buildProposalBaseQuery($companyId, $carrierId, $startDate, $endDate)
            ->whereIn('freight_quote_proposals.status_resposta', ['pendente', 'respondida'])
            ->countAllResults();

        $respondedProposalCount = $this->buildProposalBaseQuery($companyId, $carrierId, $startDate, $endDate)
            ->where('freight_quote_proposals.status_resposta', 'respondida')
            ->countAllResults();

        $activeTripCount = $this->documents
            ->where('company_id', $companyId)
            ->where('transporter_id', $carrierId)
            ->whereIn('status', ['programada', 'em_coleta', 'em_transito', 'entregue'])
            ->countAllResults();

        $openIncidentCount = $documentIds === []
            ? 0
            : $this->incidents
                ->where('company_id', $companyId)
                ->whereIn('transport_document_id', $documentIds)
                ->whereIn('status', ['aberta', 'em_tratativa'])
                ->countAllResults();

        $pendingDocumentCount = $this->documents
            ->where('company_id', $companyId)
            ->where('transporter_id', $carrierId)
            ->whereNotIn('status', ['cancelada', 'finalizada'])
            ->where(
                'NOT EXISTS (SELECT 1 FROM trip_documents td WHERE td.ordem_transporte_id = transport_documents.id AND td.deleted_at IS NULL)',
                null,
                false
            )
            ->countAllResults();

        $financialPendingCount = $this->hasPermission('financial.view')
            ? $this->financialEntries
                ->where('company_id', $companyId)
                ->where('transporter_id', $carrierId)
                ->whereIn('status', ['pendente', 'em_analise', 'bloqueado', 'liberado'])
                ->countAllResults()
            : null;

        return $this->respondSuccess([
            'cards' => [
                'received_quotations' => $pendingQuotationCount,
                'responded_proposals' => $respondedProposalCount,
                'active_trips' => $activeTripCount,
                'open_incidents' => $openIncidentCount,
                'pending_documents' => $pendingDocumentCount,
                'financial_pending' => $financialPendingCount,
            ],
            'quick_lists' => [
                'quotations' => $this->buildProposalBaseQuery($companyId, $carrierId, $startDate, $endDate)
                    ->select('freight_quotations.id as quotation_id, freight_quote_proposals.id, freight_quotations.data_limite_resposta, freight_quote_proposals.status_resposta, freight_quote_proposals.valor_frete, freight_quote_proposals.prazo_entrega_dias')
                    ->orderBy('freight_quotations.id', 'DESC')
                    ->findAll(5),
                'transport_documents' => $this->documents
                    ->select('id, numero_ot, status, data_coleta_prevista, data_entrega_prevista, created_at')
                    ->where('company_id', $companyId)
                    ->where('transporter_id', $carrierId)
                    ->orderBy('id', 'DESC')
                    ->findAll(5),
                'incidents' => $documentIds === []
                    ? []
                    : $this->incidents
                        ->select('incidents.id, incidents.tipo_ocorrencia, incidents.status, incidents.occurred_at, transport_documents.numero_ot')
                        ->join('transport_documents', 'transport_documents.id = incidents.transport_document_id')
                        ->where('incidents.company_id', $companyId)
                        ->whereIn('incidents.transport_document_id', $documentIds)
                        ->orderBy('incidents.occurred_at', 'DESC')
                        ->findAll(5),
            ],
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ], 'Dashboard da transportadora carregado com sucesso.');
    }

    private function buildProposalBaseQuery(int $companyId, int $carrierId, ?string $startDate, ?string $endDate)
    {
        $builder = $this->proposals
            ->select('freight_quote_proposals.*, freight_quotations.id as quotation_id, freight_quotations.status as quotation_status, freight_quotations.data_envio, freight_quotations.data_limite_resposta')
            ->join('freight_quotations', 'freight_quotations.id = freight_quote_proposals.cotacao_id')
            ->where('freight_quotations.company_id', $companyId)
            ->where('freight_quote_proposals.transporter_id', $carrierId);

        if ($startDate !== null) {
            $builder->where('freight_quotations.data_envio >=', $startDate);
        }

        if ($endDate !== null) {
            $builder->where('freight_quotations.data_envio <=', $endDate);
        }

        return $builder;
    }

    private function resolvePeriod(): array
    {
        $startDate = trim((string) ($this->request->getGet('start_date') ?? ''));
        $endDate = trim((string) ($this->request->getGet('end_date') ?? ''));

        return [$startDate !== '' ? $startDate : null, $endDate !== '' ? $endDate : null];
    }
}
