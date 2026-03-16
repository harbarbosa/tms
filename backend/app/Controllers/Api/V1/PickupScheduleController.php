<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\PickupScheduleModel;
use App\Models\TransportDocumentModel;
use App\Services\SystemCatalogService;
use App\Validation\PickupScheduleValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class PickupScheduleController extends BaseApiController
{
    private const STATUS_FLOW = ['agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'ausente'];

    private CarrierModel $carriers;

    private TransportDocumentModel $documents;

    private SystemCatalogService $catalogService;

    public function __construct(private readonly PickupScheduleModel $schedules = new PickupScheduleModel())
    {
        $this->carriers = new CarrierModel();
        $this->documents = new TransportDocumentModel();
        $this->catalogService = new SystemCatalogService();
    }

    public function index()
    {
        $this->requirePermission('pickup_schedules.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);
        $unit = trim((string) ($this->request->getGet('unidade_origem') ?? ''));
        $dateFrom = trim((string) ($this->request->getGet('data_inicio') ?? ''));
        $dateTo = trim((string) ($this->request->getGet('data_fim') ?? ''));

        $builder = $this->schedules
            ->select('pickup_schedules.*, carriers.razao_social as transporter_name, transport_documents.numero_ot')
            ->join('carriers', 'carriers.id = pickup_schedules.transporter_id')
            ->join('transport_documents', 'transport_documents.id = pickup_schedules.transport_document_id', 'left')
            ->where('pickup_schedules.company_id', $companyId)
            ->orderBy('pickup_schedules.data_agendada', 'DESC')
            ->orderBy('pickup_schedules.hora_inicio', 'DESC');

        if ($status !== '') {
            $builder->where('pickup_schedules.status', $status);
        }

        if ($transporterId > 0) {
            $builder->where('pickup_schedules.transporter_id', $transporterId);
        }

        if ($unit !== '') {
            $builder->like('pickup_schedules.unidade_origem', $unit);
        }

        if ($dateFrom !== '') {
            $builder->where('pickup_schedules.data_agendada >=', $dateFrom);
        }

        if ($dateTo !== '') {
            $builder->where('pickup_schedules.data_agendada <=', $dateTo);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->schedules->pager;

        return $this->respondSuccess([
            'items' => $items,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'pageCount' => $pager->getPageCount(),
            ],
            'filters' => [
                'status' => $status,
                'transporter_id' => $transporterId > 0 ? $transporterId : null,
                'unidade_origem' => $unit,
                'data_inicio' => $dateFrom,
                'data_fim' => $dateTo,
            ],
            'statusOptions' => $this->buildOptions($companyId)['statusOptions'],
        ], 'Agendamentos carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('pickup_schedules.view');
        $schedule = $this->findScheduleOrFail($id);

        return $this->respondSuccess([
            ...$schedule,
            'options' => $this->buildOptions((int) $schedule['company_id']),
            'next_modules' => [
                'checkin' => in_array($schedule['status'], ['confirmado', 'em_atendimento', 'concluido'], true),
            ],
        ], 'Agendamento carregado com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('pickup_schedules.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            ...$this->buildOptions($companyId),
        ], 'Opcoes de agendamento carregadas com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('pickup_schedules.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, PickupScheduleValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o agendamento.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;

        $errors = $this->validateDomainRules($companyId, $data);
        if ($errors !== []) {
            return $this->respondError('Nao foi possivel salvar o agendamento.', $errors, 422);
        }

        $this->schedules->insert($data);

        return $this->respondSuccess(
            $this->findScheduleOrFail((int) $this->schedules->getInsertID()),
            'Agendamento criado com sucesso.',
            201
        );
    }

    public function update(int $id)
    {
        $this->requirePermission('pickup_schedules.update');
        $schedule = $this->findScheduleOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, PickupScheduleValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o agendamento.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $schedule['company_id'];

        $errors = $this->validateDomainRules((int) $schedule['company_id'], $data, $id);
        if ($errors !== []) {
            return $this->respondError('Nao foi possivel atualizar o agendamento.', $errors, 422);
        }

        $this->schedules->update($id, $data);

        return $this->respondSuccess($this->findScheduleOrFail($id), 'Agendamento atualizado com sucesso.');
    }

    private function findScheduleOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $schedule = $this->schedules
            ->select('pickup_schedules.*, carriers.razao_social as transporter_name, transport_documents.numero_ot, transport_documents.status as ordem_status, transport_documents.data_coleta_prevista, transport_documents.data_entrega_prevista')
            ->join('carriers', 'carriers.id = pickup_schedules.transporter_id')
            ->join('transport_documents', 'transport_documents.id = pickup_schedules.transport_document_id', 'left')
            ->where('pickup_schedules.company_id', $companyId)
            ->find($id);

        if ($schedule === null) {
            throw PageNotFoundException::forPageNotFound('Agendamento nao encontrado.');
        }

        return $schedule;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'transport_document_id',
            'transporter_id',
            'unidade_origem',
            'doca',
            'data_agendada',
            'hora_inicio',
            'hora_fim',
            'janela_atendimento',
            'responsavel_agendamento',
            'observacoes',
            'status',
        ];

        $data = [];
        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['transport_document_id', 'doca', 'janela_atendimento', 'responsavel_agendamento', 'observacoes'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['status'] = $data['status'] ?: 'agendado';

        return $data;
    }

    private function validateDomainRules(int $companyId, array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        if (! $this->carriers->where('company_id', $companyId)->find((int) $data['transporter_id'])) {
            $errors['transporter_id'] = 'A transportadora informada nao pertence a empresa atual.';
        }

        if (! empty($data['transport_document_id'])) {
            $document = $this->documents->where('company_id', $companyId)->find((int) $data['transport_document_id']);

            if ($document === null) {
                $errors['transport_document_id'] = 'A ordem de transporte informada nao pertence a empresa atual.';
            } elseif ((int) $document['transporter_id'] !== (int) $data['transporter_id']) {
                $errors['transporter_id'] = 'A transportadora deve corresponder a ordem de transporte selecionada.';
            }
        }

        if (($data['hora_inicio'] ?? '') >= ($data['hora_fim'] ?? '')) {
            $errors['hora_fim'] = 'A hora final deve ser maior que a hora inicial.';
        }

        $duplicate = $this->schedules
            ->where('company_id', $companyId)
            ->where('transporter_id', (int) $data['transporter_id'])
            ->where('data_agendada', $data['data_agendada'])
            ->groupStart()
            ->where('hora_inicio', $data['hora_inicio'])
            ->orWhere('hora_fim', $data['hora_fim'])
            ->groupEnd();

        if ($ignoreId !== null) {
            $duplicate->where('id !=', $ignoreId);
        }

        if ($duplicate->first() !== null) {
            $errors['hora_inicio'] = 'Ja existe um agendamento conflitante para esta transportadora no periodo informado.';
        }

        return $errors;
    }

    private function buildOptions(int $companyId): array
    {
        $catalogs = $this->catalogService->groupedOptions($companyId, ['operational_units', 'docks', 'pickup_schedule_statuses']);

        return [
            'transporters' => $this->carriers
                ->select('id, razao_social, nome_fantasia, status')
                ->where('company_id', $companyId)
                ->orderBy('razao_social', 'ASC')
                ->findAll(),
            'transport_documents' => $this->documents
                ->select('id, numero_ot, transporter_id, data_coleta_prevista, data_entrega_prevista, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
            'unitOptions' => array_map(static fn (array $item): string => $item['label'], $catalogs['operational_units'] ?? []),
            'dockOptions' => array_map(static fn (array $item): string => $item['label'], $catalogs['docks'] ?? []),
            'statusOptions' => array_map(static fn (array $item): string => $item['label'], $catalogs['pickup_schedule_statuses'] ?? []),
        ];
    }
}
