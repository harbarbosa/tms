<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\DriverModel;
use App\Models\PickupScheduleModel;
use App\Models\TrackingEventModel;
use App\Models\TransportDocumentModel;
use App\Models\VehicleCheckinModel;
use App\Models\VehicleModel;
use App\Services\SystemCatalogService;
use App\Validation\VehicleCheckinValidation;
use CodeIgniter\Exceptions\PageNotFoundException;
use CodeIgniter\I18n\Time;

class VehicleCheckinController extends BaseApiController
{
    private const STATUS_FLOW = ['aguardando', 'chegou', 'em_doca', 'carregando', 'finalizado', 'recusado'];

    private CarrierModel $carriers;

    private DriverModel $drivers;

    private VehicleModel $vehicles;

    private PickupScheduleModel $pickupSchedules;

    private TransportDocumentModel $documents;

    private SystemCatalogService $catalogService;

    private TrackingEventModel $trackingEvents;

    public function __construct(private readonly VehicleCheckinModel $checkins = new VehicleCheckinModel())
    {
        $this->carriers = new CarrierModel();
        $this->drivers = new DriverModel();
        $this->vehicles = new VehicleModel();
        $this->pickupSchedules = new PickupScheduleModel();
        $this->documents = new TransportDocumentModel();
        $this->catalogService = new SystemCatalogService();
        $this->trackingEvents = new TrackingEventModel();
    }

    public function index()
    {
        $this->requirePermission('vehicle_checkins.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $date = trim((string) ($this->request->getGet('data') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);
        $vehicleId = (int) ($this->request->getGet('vehicle_id') ?? 0);
        $doca = trim((string) ($this->request->getGet('doca') ?? ''));

        $builder = $this->baseListBuilder($companyId);
        $this->applyOwnedGateScope($builder);

        if ($status !== '') {
            $builder->where('vehicle_checkins.status', $status);
        }

        if ($date !== '') {
            $builder->groupStart()
                ->where('DATE(vehicle_checkins.horario_chegada)', $date)
                ->orWhere('DATE(pickup_schedules.data_agendada)', $date)
                ->groupEnd();
        }

        if ($transporterId > 0) {
            $builder->where('vehicle_checkins.transporter_id', $transporterId);
        }

        if ($vehicleId > 0) {
            $builder->where('vehicle_checkins.vehicle_id', $vehicleId);
        }

        if ($doca !== '') {
            $builder->like('vehicle_checkins.doca', $doca);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->checkins->pager;

        $items = array_map(fn (array $item): array => [
            ...$item,
            'operational_flags' => $this->buildOperationalFlags($item),
        ], $items);

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
                'data' => $date,
                'transporter_id' => $transporterId > 0 ? $transporterId : null,
                'vehicle_id' => $vehicleId > 0 ? $vehicleId : null,
                'doca' => $doca,
            ],
            'statusOptions' => $this->buildOptions($companyId)['statusOptions'],
        ], 'Check-ins carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('vehicle_checkins.view');
        $checkin = $this->findCheckinOrFail($id);

        return $this->respondSuccess([
            ...$checkin,
            'options' => $this->buildOptions((int) $checkin['company_id']),
            'operational_flags' => $this->buildOperationalFlags($checkin),
        ], 'Check-in carregado com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('vehicle_checkins.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            ...$this->buildOptions($companyId),
        ], 'Opcoes do check-in carregadas com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('vehicle_checkins.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, VehicleCheckinValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o check-in.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;
        $data = $this->enrichFromSchedule($companyId, $data);

        $errors = $this->validateDomainRules($companyId, $data);
        if ($errors !== []) {
            return $this->respondError('Nao foi possivel salvar o check-in.', $errors, 422);
        }

        $this->checkins->insert($data);
        $checkinId = (int) $this->checkins->getInsertID();
        $this->syncOperationalStatuses($companyId, $this->findCheckinOrFail($checkinId));

        return $this->respondSuccess(
            $this->findCheckinOrFail($checkinId),
            'Check-in criado com sucesso.',
            201
        );
    }

    public function update(int $id)
    {
        $this->requirePermission('vehicle_checkins.update');
        $checkin = $this->findCheckinOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, VehicleCheckinValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o check-in.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $checkin['company_id'];
        $data = $this->enrichFromSchedule((int) $checkin['company_id'], $data);

        $errors = $this->validateDomainRules((int) $checkin['company_id'], $data, $id);
        if ($errors !== []) {
            return $this->respondError('Nao foi possivel atualizar o check-in.', $errors, 422);
        }

        $this->checkins->update($id, $data);
        $this->syncOperationalStatuses((int) $checkin['company_id'], $this->findCheckinOrFail($id));

        return $this->respondSuccess($this->findCheckinOrFail($id), 'Check-in atualizado com sucesso.');
    }

    public function registerEntry(int $id)
    {
        $this->requirePermission('vehicle_checkins.update');
        $checkin = $this->findCheckinOrFail($id);
        $timestamp = trim((string) (($this->request->getJSON(true)['horario_entrada'] ?? '') ?: ''));
        $entryTime = $timestamp !== '' ? $timestamp : Time::now()->toDateTimeString();

        $this->checkins->update($id, [
            'horario_entrada' => $entryTime,
            'status' => 'em_doca',
        ]);
        $this->syncOperationalStatuses((int) $checkin['company_id'], $this->findCheckinOrFail($id));

        return $this->respondSuccess($this->findCheckinOrFail($id), 'Entrada registrada com sucesso.');
    }

    public function registerExit(int $id)
    {
        $this->requirePermission('vehicle_checkins.update');
        $checkin = $this->findCheckinOrFail($id);
        $timestamp = trim((string) (($this->request->getJSON(true)['horario_saida'] ?? '') ?: ''));
        $exitTime = $timestamp !== '' ? $timestamp : Time::now()->toDateTimeString();

        $this->checkins->update($id, [
            'horario_saida' => $exitTime,
            'status' => 'finalizado',
        ]);
        $this->syncOperationalStatuses((int) $checkin['company_id'], $this->findCheckinOrFail($id));

        return $this->respondSuccess($this->findCheckinOrFail($id), 'Saida registrada com sucesso.');
    }

    private function findCheckinOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->baseListBuilder($companyId)->where('vehicle_checkins.id', $id);
        $this->applyOwnedGateScope($builder);
        $checkin = $builder->first();

        if ($checkin === null) {
            throw PageNotFoundException::forPageNotFound('Check-in nao encontrado.');
        }

        return $checkin;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'transport_document_id',
            'pickup_schedule_id',
            'transporter_id',
            'driver_id',
            'vehicle_id',
            'placa',
            'doca',
            'horario_chegada',
            'horario_entrada',
            'horario_saida',
            'status',
            'observacoes',
            'divergencia',
        ];

        $data = [];
        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['transport_document_id', 'pickup_schedule_id', 'driver_id', 'vehicle_id', 'placa', 'doca', 'horario_chegada', 'horario_entrada', 'horario_saida', 'observacoes'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['divergencia'] = in_array($data['divergencia'], [1, '1', true, 'true'], true) ? 1 : 0;
        $data['status'] = $data['status'] ?: 'aguardando';

        if (! empty($data['vehicle_id'])) {
            $vehicle = $this->vehicles->find((int) $data['vehicle_id']);
            $data['placa'] = $vehicle['placa'] ?? $data['placa'];
        }

        return $data;
    }

    private function enrichFromSchedule(int $companyId, array $data): array
    {
        if (empty($data['pickup_schedule_id'])) {
            return $data;
        }

        $schedule = $this->pickupSchedules->where('company_id', $companyId)->find((int) $data['pickup_schedule_id']);

        if ($schedule === null) {
            return $data;
        }

        if (empty($data['transport_document_id']) && ! empty($schedule['transport_document_id'])) {
            $data['transport_document_id'] = $schedule['transport_document_id'];
        }

        if (empty($data['doca']) && ! empty($schedule['doca'])) {
            $data['doca'] = $schedule['doca'];
        }

        if (empty($data['transporter_id']) && ! empty($schedule['transporter_id'])) {
            $data['transporter_id'] = $schedule['transporter_id'];
        }

        return $data;
    }

    private function validateDomainRules(int $companyId, array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        if (empty($data['transport_document_id']) && empty($data['pickup_schedule_id'])) {
            $errors['pickup_schedule_id'] = 'Informe ao menos um agendamento ou uma ordem de transporte para o check-in.';
        }

        if (! $this->carriers->where('company_id', $companyId)->find((int) $data['transporter_id'])) {
            $errors['transporter_id'] = 'A transportadora informada nao pertence a empresa atual.';
        }

        $document = null;
        if (! empty($data['transport_document_id'])) {
            $document = $this->documents->where('company_id', $companyId)->find((int) $data['transport_document_id']);

            if ($document === null) {
                $errors['transport_document_id'] = 'A ordem de transporte informada nao pertence a empresa atual.';
            } elseif ((int) $document['transporter_id'] !== (int) $data['transporter_id']) {
                $errors['transporter_id'] = 'A transportadora deve corresponder a ordem de transporte selecionada.';
            }
        }

        if (! empty($data['pickup_schedule_id'])) {
            $schedule = $this->pickupSchedules->where('company_id', $companyId)->find((int) $data['pickup_schedule_id']);

            if ($schedule === null) {
                $errors['pickup_schedule_id'] = 'O agendamento informado nao pertence a empresa atual.';
            } else {
                if ((int) $schedule['transporter_id'] !== (int) $data['transporter_id']) {
                    $errors['transporter_id'] = 'A transportadora deve corresponder ao agendamento selecionado.';
                }

                if (! empty($schedule['transport_document_id'])) {
                    if (! empty($data['transport_document_id']) && (int) $schedule['transport_document_id'] !== (int) $data['transport_document_id']) {
                        $errors['transport_document_id'] = 'A ordem de transporte deve ser a mesma vinculada ao agendamento.';
                    } else {
                        $data['transport_document_id'] = $schedule['transport_document_id'];
                    }
                }
            }
        }

        if (! empty($data['driver_id'])) {
            $driver = $this->drivers->where('company_id', $companyId)->find((int) $data['driver_id']);

            if ($driver === null) {
                $errors['driver_id'] = 'O motorista informado nao pertence a empresa atual.';
            } elseif ((int) $driver['transporter_id'] !== (int) $data['transporter_id']) {
                $errors['driver_id'] = 'O motorista precisa pertencer a transportadora selecionada.';
            }
        }

        if (! empty($data['vehicle_id'])) {
            $vehicle = $this->vehicles->where('company_id', $companyId)->find((int) $data['vehicle_id']);

            if ($vehicle === null) {
                $errors['vehicle_id'] = 'O veiculo informado nao pertence a empresa atual.';
            } elseif ((int) $vehicle['transporter_id'] !== (int) $data['transporter_id']) {
                $errors['vehicle_id'] = 'O veiculo precisa pertencer a transportadora selecionada.';
            } elseif (! empty($data['placa']) && strtoupper((string) $vehicle['placa']) !== strtoupper((string) $data['placa'])) {
                $errors['placa'] = 'A placa informada deve corresponder ao veiculo selecionado.';
            }
        }

        foreach ([['horario_chegada', 'horario_entrada'], ['horario_entrada', 'horario_saida']] as [$startField, $endField]) {
            if (! empty($data[$startField]) && ! empty($data[$endField]) && strtotime((string) $data[$endField]) < strtotime((string) $data[$startField])) {
                $errors[$endField] = 'A ordem cronologica dos horarios esta invalida.';
            }
        }

        $duplicate = $this->checkins
            ->where('company_id', $companyId);

        if (! empty($data['pickup_schedule_id'])) {
            $duplicate->where('pickup_schedule_id', (int) $data['pickup_schedule_id']);
        } elseif (! empty($data['transport_document_id']) && ! empty($data['vehicle_id'])) {
            $duplicate->where('transport_document_id', (int) $data['transport_document_id'])
                ->where('vehicle_id', (int) $data['vehicle_id']);
        }

        if ($ignoreId !== null) {
            $duplicate->where('id !=', $ignoreId);
        }

        if ($duplicate->first() !== null) {
            $errors['pickup_schedule_id'] = 'Ja existe um check-in registrado para esta referencia operacional.';
        }

        return $errors;
    }

    private function buildOptions(int $companyId): array
    {
        $transporters = $this->carriers
            ->select('id, razao_social, nome_fantasia, status')
            ->where('company_id', $companyId)
            ->orderBy('razao_social', 'ASC');
        $drivers = $this->drivers
            ->select('id, transporter_id, nome, status')
            ->where('company_id', $companyId)
            ->orderBy('nome', 'ASC');
        $vehicles = $this->vehicles
            ->select('id, transporter_id, placa, tipo_veiculo, status')
            ->where('company_id', $companyId)
            ->orderBy('placa', 'ASC');

        $scope = $this->getCurrentScope();
        $role = $this->getCurrentRole();

        if ($role === 'carrier' && ! empty($scope['carrier_id'])) {
            $carrierId = (int) $scope['carrier_id'];
            $transporters->where('id', $carrierId);
            $drivers->where('transporter_id', $carrierId);
            $vehicles->where('transporter_id', $carrierId);
        }

        if ($role === 'driver' && ! empty($scope['driver_id'])) {
            $drivers->where('id', (int) $scope['driver_id']);
        }

        $catalogs = $this->catalogService->groupedOptions($companyId, ['docks', 'vehicle_checkin_statuses']);

        return [
            'transporters' => $transporters->findAll(),
            'drivers' => $drivers->findAll(),
            'vehicles' => $vehicles->findAll(),
            'pickup_schedules' => $this->pickupSchedules
                ->select('id, transport_document_id, transporter_id, unidade_origem, doca, data_agendada, hora_inicio, hora_fim, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
            'transport_documents' => $this->documents
                ->select('id, numero_ot, transporter_id, driver_id, vehicle_id, data_coleta_prevista, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
            'dockOptions' => array_map(static fn (array $item): string => $item['label'], $catalogs['docks'] ?? []),
            'statusOptions' => array_map(static fn (array $item): string => $item['label'], $catalogs['vehicle_checkin_statuses'] ?? []),
        ];
    }

    private function baseListBuilder(int $companyId)
    {
        return $this->checkins
            ->select('vehicle_checkins.*, carriers.razao_social as transporter_name, drivers.nome as driver_name, vehicles.placa as vehicle_plate, transport_documents.numero_ot, pickup_schedules.unidade_origem, pickup_schedules.data_agendada, pickup_schedules.hora_inicio, pickup_schedules.hora_fim')
            ->join('carriers', 'carriers.id = vehicle_checkins.transporter_id')
            ->join('drivers', 'drivers.id = vehicle_checkins.driver_id', 'left')
            ->join('vehicles', 'vehicles.id = vehicle_checkins.vehicle_id', 'left')
            ->join('transport_documents', 'transport_documents.id = vehicle_checkins.transport_document_id', 'left')
            ->join('pickup_schedules', 'pickup_schedules.id = vehicle_checkins.pickup_schedule_id', 'left')
            ->where('vehicle_checkins.company_id', $companyId)
            ->orderBy('vehicle_checkins.id', 'DESC');
    }

    private function applyOwnedGateScope($builder): void
    {
        $role = $this->getCurrentRole();
        $scope = $this->getCurrentScope();

        if ($role === 'carrier') {
            $builder->where('vehicle_checkins.transporter_id', (int) ($scope['carrier_id'] ?? 0));
        }

        if ($role === 'driver') {
            $builder->where('vehicle_checkins.driver_id', (int) ($scope['driver_id'] ?? 0));
        }
    }

    private function buildOperationalFlags(array $checkin): array
    {
        $isDelayed = false;

        if (! empty($checkin['horario_chegada']) && ! empty($checkin['data_agendada']) && ! empty($checkin['hora_inicio'])) {
            $scheduledAt = strtotime(sprintf('%s %s:00', $checkin['data_agendada'], $checkin['hora_inicio']));
            $arrivalAt = strtotime((string) $checkin['horario_chegada']);
            $isDelayed = $arrivalAt > $scheduledAt;
        }

        return [
            'delayed' => $isDelayed,
            'divergencia' => (bool) ($checkin['divergencia'] ?? false),
        ];
    }

    private function syncOperationalStatuses(int $companyId, array $checkin): void
    {
        if (! empty($checkin['pickup_schedule_id'])) {
            $scheduleStatus = match ($checkin['status']) {
                'chegou', 'em_doca', 'carregando' => 'em_atendimento',
                'finalizado' => 'concluido',
                'recusado' => 'cancelado',
                default => 'confirmado',
            };

            $this->pickupSchedules
                ->where('company_id', $companyId)
                ->update((int) $checkin['pickup_schedule_id'], ['status' => $scheduleStatus]);
        }

        if (! empty($checkin['transport_document_id'])) {
            $documentStatus = match ($checkin['status']) {
                'carregando', 'finalizado' => 'em_coleta',
                'recusado' => 'cancelada',
                default => 'programada',
            };

            $this->documents
                ->where('company_id', $companyId)
                ->update((int) $checkin['transport_document_id'], ['status' => $documentStatus]);

            if ($checkin['status'] === 'finalizado') {
                $latestEvent = $this->trackingEvents
                    ->where('transport_document_id', (int) $checkin['transport_document_id'])
                    ->orderBy('event_at', 'DESC')
                    ->orderBy('id', 'DESC')
                    ->first();

                if (($latestEvent['status'] ?? null) !== 'coletado') {
                    $this->trackingEvents->insert([
                        'company_id' => $companyId,
                        'transport_document_id' => (int) $checkin['transport_document_id'],
                        'status' => 'coletado',
                        'event_at' => $checkin['horario_saida'] ?: Time::now()->toDateTimeString(),
                        'observacoes' => 'Veiculo liberado na doca e coleta iniciada.',
                        'attachment_path' => null,
                    ]);
                }
            }
        }
    }
}
