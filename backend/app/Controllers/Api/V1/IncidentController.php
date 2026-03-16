<?php

namespace App\Controllers\Api\V1;

use App\Models\IncidentModel;
use App\Models\TransportDocumentModel;
use App\Services\SystemCatalogService;
use App\Validation\TrackingValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class IncidentController extends BaseApiController
{
    public const TYPES = ['atraso', 'avaria', 'recusa', 'devolucao', 'extravio', 'problema_operacional'];

    public const STATUSES = ['aberta', 'em_tratativa', 'resolvida', 'cancelada'];

    private TransportDocumentModel $documents;

    private SystemCatalogService $catalogService;

    public function __construct(private readonly IncidentModel $incidents = new IncidentModel())
    {
        $this->documents = new TransportDocumentModel();
        $this->catalogService = new SystemCatalogService();
    }

    public function index()
    {
        $this->requirePermission('incidents.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $type = trim((string) ($this->request->getGet('tipo_ocorrencia') ?? ''));

        $builder = $this->incidents
            ->select('incidents.*, transport_documents.numero_ot, carriers.razao_social as transporter_name')
            ->join('transport_documents', 'transport_documents.id = incidents.transport_document_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('incidents.company_id', $companyId)
            ->orderBy('incidents.occurred_at', 'DESC')
            ->orderBy('incidents.id', 'DESC');

        $this->applyIncidentScope($builder);

        if ($search !== '') {
            $builder->groupStart()
                ->like('transport_documents.numero_ot', $search)
                ->orLike('carriers.razao_social', $search)
                ->orLike('incidents.observacoes', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('incidents.status', $status);
        }

        if ($type !== '') {
            $builder->where('incidents.tipo_ocorrencia', $type);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->incidents->pager;

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
                'tipo_ocorrencia' => $type,
            ],
            'typeOptions' => self::TYPES,
            'statusOptions' => self::STATUSES,
        ], 'Ocorrencias carregadas com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('incidents.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $typeOptions = array_map(
            static fn (array $item): string => $item['label'],
            $this->catalogService->getCatalogItems($companyId, 'incident_types')
        );

        $documentsBuilder = $this->documents
            ->select('id, numero_ot, status, transporter_id, driver_id')
            ->where('company_id', $companyId)
            ->orderBy('id', 'DESC');

        $this->applyOwnedTripScope($documentsBuilder);

        return $this->respondSuccess([
            'transport_documents' => $documentsBuilder->findAll(),
            'typeOptions' => $typeOptions,
            'statusOptions' => self::STATUSES,
        ], 'Opcoes de ocorrencia carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('incidents.view');
        $incident = $this->findIncidentOrFail($id);

        return $this->respondSuccess($incident, 'Ocorrencia carregada com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('incidents.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TrackingValidation::incidentRules())) {
            return $this->respondError('Nao foi possivel salvar a ocorrencia.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;

        if ($this->findOwnedTransportDocument((int) $data['transport_document_id'], $companyId) === null) {
            return $this->respondError('Nao foi possivel salvar a ocorrencia.', [
                'transport_document_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ], 422);
        }

        $this->incidents->insert($data);

        return $this->respondSuccess($this->findIncidentOrFail((int) $this->incidents->getInsertID()), 'Ocorrencia criada com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('incidents.update');
        $incident = $this->findIncidentOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TrackingValidation::incidentRules())) {
            return $this->respondError('Nao foi possivel atualizar a ocorrencia.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $incident['company_id'];

        if ($this->findOwnedTransportDocument((int) $data['transport_document_id'], (int) $data['company_id']) === null) {
            return $this->respondError('Nao foi possivel atualizar a ocorrencia.', [
                'transport_document_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ], 422);
        }

        $this->incidents->update($id, $data);

        return $this->respondSuccess($this->findIncidentOrFail($id), 'Ocorrencia atualizada com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('incidents.delete');
        $this->findIncidentOrFail($id);
        $this->incidents->delete($id);

        return $this->respondSuccess(null, 'Ocorrencia excluida com sucesso.');
    }

    private function findIncidentOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->incidents
            ->select('incidents.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = incidents.transport_document_id')
            ->where('incidents.company_id', $companyId)
            ->where('incidents.id', $id);

        $this->applyIncidentScope($builder);
        $incident = $builder->first();

        if ($incident === null) {
            throw PageNotFoundException::forPageNotFound('Ocorrencia nao encontrada.');
        }

        return $incident;
    }

    private function sanitizePayload(array $payload): array
    {
        $data = [];

        foreach (['transport_document_id', 'tipo_ocorrencia', 'status', 'occurred_at', 'observacoes', 'attachment_path'] as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['observacoes', 'attachment_path'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        return $data;
    }

    private function applyIncidentScope($builder): void
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

    private function applyOwnedTripScope($builder): void
    {
        $role = $this->getCurrentRole();
        $scope = $this->getCurrentScope();

        if ($role === 'carrier') {
            $builder->where('transporter_id', (int) ($scope['carrier_id'] ?? 0));
        }

        if ($role === 'driver') {
            $builder->where('driver_id', (int) ($scope['driver_id'] ?? 0));
        }
    }

    private function findOwnedTransportDocument(int $id, int $companyId): ?array
    {
        $builder = $this->documents
            ->select('transport_documents.*')
            ->where('transport_documents.company_id', $companyId)
            ->where('transport_documents.id', $id);

        $this->applyIncidentScope($builder);

        return $builder->first();
    }
}
