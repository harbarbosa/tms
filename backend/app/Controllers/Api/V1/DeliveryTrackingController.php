<?php

namespace App\Controllers\Api\V1;

use App\Models\IncidentModel;
use App\Models\TrackingEventModel;
use App\Models\TransportDocumentModel;
use App\Validation\TrackingValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class DeliveryTrackingController extends BaseApiController
{
    private const STATUS_FLOW = ['aguardando_coleta', 'coletado', 'em_transito', 'em_entrega', 'entregue', 'com_ocorrencia', 'cancelado'];

    private IncidentModel $incidents;

    public function __construct(
        private readonly TrackingEventModel $events = new TrackingEventModel(),
        private readonly TransportDocumentModel $documents = new TransportDocumentModel(),
    ) {
        $this->incidents = new IncidentModel();
    }

    public function index()
    {
        $this->requirePermission('delivery_tracking.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));

        $latestStatusSubquery = '(SELECT tracking_events.status FROM tracking_events WHERE tracking_events.transport_document_id = transport_documents.id AND tracking_events.deleted_at IS NULL ORDER BY tracking_events.event_at DESC, tracking_events.id DESC LIMIT 1)';

        $builder = $this->documents
            ->select("transport_documents.*, carriers.razao_social as transporter_name, drivers.nome as driver_name, vehicles.placa as vehicle_plate, loads.codigo_carga, transport_orders.numero_pedido, {$latestStatusSubquery} as tracking_status")
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->join('drivers', 'drivers.id = transport_documents.driver_id', 'left')
            ->join('vehicles', 'vehicles.id = transport_documents.vehicle_id', 'left')
            ->join('loads', 'loads.id = transport_documents.carga_id', 'left')
            ->join('transport_orders', 'transport_orders.id = transport_documents.pedido_id', 'left')
            ->where('transport_documents.company_id', $companyId)
            ->orderBy('transport_documents.id', 'DESC');

        $this->applyOwnedTripScope($builder);

        if ($search !== '') {
            $builder->groupStart()
                ->like('transport_documents.numero_ot', $search)
                ->orLike('carriers.razao_social', $search)
                ->orLike('loads.codigo_carga', $search)
                ->orLike('transport_orders.numero_pedido', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where($latestStatusSubquery, $status, false);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->documents->pager;

        $items = array_map(function (array $item): array {
            $item['tracking_status'] = $this->resolveTrackingStatus((int) $item['id'], $item['tracking_status'] ?? null);
            return $item;
        }, $items);

        return $this->respondSuccess([
            'items' => $items,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'pageCount' => $pager->getPageCount(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusOptions' => self::STATUS_FLOW,
        ], 'Rastreamentos carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('delivery_tracking.view');
        $document = $this->findDocumentOrFail($id);

        return $this->respondSuccess([
            ...$document,
            'tracking_status' => $this->resolveTrackingStatus($id),
            'events' => $this->getEvents($id),
            'incidents' => $this->getIncidents($id),
            'statusOptions' => self::STATUS_FLOW,
            'incidentTypes' => IncidentController::TYPES,
            'incidentStatuses' => IncidentController::STATUSES,
        ], 'Historico de rastreamento carregado com sucesso.');
    }

    public function createEvent(int $id)
    {
        $this->requirePermission('delivery_tracking.update');
        $document = $this->findDocumentOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TrackingValidation::eventRules())) {
            return $this->respondError('Nao foi possivel registrar o evento de rastreamento.', $this->validator->getErrors(), 422);
        }

        $data = [
            'company_id' => (int) $document['company_id'],
            'transport_document_id' => $id,
            'status' => trim((string) ($payload['status'] ?? '')),
            'event_at' => trim((string) ($payload['event_at'] ?? '')),
            'observacoes' => trim((string) ($payload['observacoes'] ?? '')) ?: null,
            'attachment_path' => trim((string) ($payload['attachment_path'] ?? '')) ?: null,
        ];

        $this->events->insert($data);
        $this->syncTransportDocumentStatus($id, $data['status']);

        return $this->respondSuccess([
            'tracking_status' => $this->resolveTrackingStatus($id),
            'events' => $this->getEvents($id),
        ], 'Evento de rastreamento registrado com sucesso.', 201);
    }

    private function findDocumentOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->documents
            ->select('transport_documents.*, carriers.razao_social as transporter_name, drivers.nome as driver_name, vehicles.placa as vehicle_plate, loads.codigo_carga, transport_orders.numero_pedido')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->join('drivers', 'drivers.id = transport_documents.driver_id', 'left')
            ->join('vehicles', 'vehicles.id = transport_documents.vehicle_id', 'left')
            ->join('loads', 'loads.id = transport_documents.carga_id', 'left')
            ->join('transport_orders', 'transport_orders.id = transport_documents.pedido_id', 'left')
            ->where('transport_documents.company_id', $companyId)
            ->where('transport_documents.id', $id);

        $this->applyOwnedTripScope($builder);
        $document = $builder->first();

        if ($document === null) {
            throw PageNotFoundException::forPageNotFound('Ordem de transporte nao encontrada para rastreamento.');
        }

        return $document;
    }

    private function applyOwnedTripScope($builder): void
    {
        $role = $this->getCurrentRole();
        $scope = $this->getCurrentScope();

        if ($role === 'carrier') {
            $builder->where('transport_documents.transporter_id', (int) ($scope['carrier_id'] ?? 0));
        }

        if ($role === 'driver') {
            $builder->where('transport_documents.driver_id', (int) ($scope['driver_id'] ?? 0));
        }
    }

    private function getEvents(int $documentId): array
    {
        return $this->events
            ->where('transport_document_id', $documentId)
            ->orderBy('event_at', 'DESC')
            ->orderBy('id', 'DESC')
            ->findAll();
    }

    private function getIncidents(int $documentId): array
    {
        return $this->incidents
            ->where('transport_document_id', $documentId)
            ->orderBy('occurred_at', 'DESC')
            ->orderBy('id', 'DESC')
            ->findAll();
    }

    private function getCurrentTrackingStatus(int $documentId): string
    {
        $event = $this->events
            ->where('transport_document_id', $documentId)
            ->orderBy('event_at', 'DESC')
            ->orderBy('id', 'DESC')
            ->first();

        return $event['status'] ?? 'aguardando_coleta';
    }

    private function resolveTrackingStatus(int $documentId, ?string $fallback = null): string
    {
        $baseStatus = $fallback ?: $this->getCurrentTrackingStatus($documentId);

        if (in_array($baseStatus, ['entregue', 'cancelado'], true)) {
            return $baseStatus;
        }

        $openIncident = $this->incidents
            ->where('transport_document_id', $documentId)
            ->whereIn('status', ['aberta', 'em_tratativa'])
            ->first();

        return $openIncident ? 'com_ocorrencia' : $baseStatus;
    }

    private function syncTransportDocumentStatus(int $documentId, string $trackingStatus): void
    {
        $map = [
            'aguardando_coleta' => 'programada',
            'coletado' => 'em_coleta',
            'em_transito' => 'em_transito',
            'em_entrega' => 'em_transito',
            'entregue' => 'entregue',
            'com_ocorrencia' => 'em_transito',
            'cancelado' => 'cancelada',
        ];

        $this->documents->update($documentId, [
            'status' => $map[$trackingStatus] ?? 'programada',
        ]);
    }
}
