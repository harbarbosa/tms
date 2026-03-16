<?php

namespace App\Controllers\Api\V1;

use App\Models\IncidentModel;
use App\Models\TrackingEventModel;
use App\Models\TransportDocumentModel;
use App\Models\TripDocumentModel;

class DriverPortalController extends BaseApiController
{
    public function __construct(
        private readonly TransportDocumentModel $documents = new TransportDocumentModel(),
        private readonly IncidentModel $incidents = new IncidentModel(),
        private readonly TripDocumentModel $tripDocuments = new TripDocumentModel(),
        private readonly TrackingEventModel $trackingEvents = new TrackingEventModel(),
    ) {
    }

    public function dashboard()
    {
        $this->requirePermission('dashboard.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $driverId = (int) ($this->getCurrentScope()['driver_id'] ?? 0);

        if ($this->getCurrentRole() !== 'driver' || $driverId <= 0) {
            return $this->respondError('Portal do motorista indisponivel para o perfil atual.', null, 403);
        }

        $documentIds = $this->documents
            ->select('id')
            ->where('company_id', $companyId)
            ->where('driver_id', $driverId)
            ->findColumn('id') ?: [];

        $activeTripCount = $this->documents
            ->where('company_id', $companyId)
            ->where('driver_id', $driverId)
            ->whereIn('status', ['programada', 'em_coleta', 'em_transito', 'entregue'])
            ->countAllResults();

        $inTransitCount = $documentIds === []
            ? 0
            : $this->trackingEvents
                ->whereIn('transport_document_id', $documentIds)
                ->whereIn('status', ['coletado', 'em_transito', 'em_entrega', 'com_ocorrencia'])
                ->countAllResults();

        $openIncidentCount = $documentIds === []
            ? 0
            : $this->incidents
                ->where('company_id', $companyId)
                ->whereIn('transport_document_id', $documentIds)
                ->whereIn('status', ['aberta', 'em_tratativa'])
                ->countAllResults();

        $pendingProofCount = $this->documents
            ->where('company_id', $companyId)
            ->where('driver_id', $driverId)
            ->where('status !=', 'cancelada')
            ->where(
                'NOT EXISTS (SELECT 1 FROM delivery_receipts dr WHERE dr.ordem_transporte_id = transport_documents.id AND dr.deleted_at IS NULL)',
                null,
                false
            )
            ->countAllResults();

        $availableDocumentCount = $documentIds === []
            ? 0
            : $this->tripDocuments
                ->where('company_id', $companyId)
                ->whereIn('ordem_transporte_id', $documentIds)
                ->countAllResults();

        return $this->respondSuccess([
            'cards' => [
                'active_trips' => $activeTripCount,
                'in_transit' => $inTransitCount,
                'open_incidents' => $openIncidentCount,
                'pending_proofs' => $pendingProofCount,
                'available_documents' => $availableDocumentCount,
            ],
            'quick_lists' => [
                'transport_documents' => $this->documents
                    ->select('id, numero_ot, status, data_coleta_prevista, data_entrega_prevista, observacoes')
                    ->where('company_id', $companyId)
                    ->where('driver_id', $driverId)
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
                'trip_documents' => $documentIds === []
                    ? []
                    : $this->tripDocuments
                        ->select('trip_documents.id, trip_documents.tipo_documento, trip_documents.nome_arquivo_original, trip_documents.created_at, transport_documents.numero_ot')
                        ->join('transport_documents', 'transport_documents.id = trip_documents.ordem_transporte_id')
                        ->where('trip_documents.company_id', $companyId)
                        ->whereIn('trip_documents.ordem_transporte_id', $documentIds)
                        ->orderBy('trip_documents.id', 'DESC')
                        ->findAll(5),
            ],
        ], 'Dashboard do motorista carregado com sucesso.');
    }
}
