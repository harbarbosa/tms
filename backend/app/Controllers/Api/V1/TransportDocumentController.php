<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\DriverModel;
use App\Models\FreightHiringModel;
use App\Models\LoadModel;
use App\Models\TransportDocumentModel;
use App\Models\TransportOrderModel;
use App\Models\VehicleModel;
use App\Validation\TransportDocumentValidation;
use CodeIgniter\Exceptions\PageNotFoundException;
use CodeIgniter\I18n\Time;

class TransportDocumentController extends BaseApiController
{
    private const STATUS_FLOW = ['rascunho', 'programada', 'em_coleta', 'em_transito', 'entregue', 'finalizada', 'cancelada'];

    private CarrierModel $carriers;

    private DriverModel $drivers;

    private VehicleModel $vehicles;

    private LoadModel $loads;

    private TransportOrderModel $orders;

    private FreightHiringModel $hirings;

    public function __construct(private readonly TransportDocumentModel $documents = new TransportDocumentModel())
    {
        $this->carriers = new CarrierModel();
        $this->drivers = new DriverModel();
        $this->vehicles = new VehicleModel();
        $this->loads = new LoadModel();
        $this->orders = new TransportOrderModel();
        $this->hirings = new FreightHiringModel();
    }

    public function index()
    {
        $this->requirePermission('transport_documents.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);
        $loadId = (int) ($this->request->getGet('carga_id') ?? 0);
        $orderId = (int) ($this->request->getGet('pedido_id') ?? 0);

        $builder = $this->documents
            ->select('transport_documents.*, carriers.razao_social as transporter_name, drivers.nome as driver_name, vehicles.placa as vehicle_plate, loads.codigo_carga, transport_orders.numero_pedido')
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
            $builder->where('transport_documents.status', $status);
        }

        if ($transporterId > 0) {
            $builder->where('transport_documents.transporter_id', $transporterId);
        }

        if ($loadId > 0) {
            $builder->where('transport_documents.carga_id', $loadId);
        }

        if ($orderId > 0) {
            $builder->where('transport_documents.pedido_id', $orderId);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->documents->pager;

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
                'transporter_id' => $transporterId > 0 ? $transporterId : null,
                'carga_id' => $loadId > 0 ? $loadId : null,
                'pedido_id' => $orderId > 0 ? $orderId : null,
            ],
            'statusOptions' => self::STATUS_FLOW,
        ], 'Ordens de transporte carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('transport_documents.view');
        $document = $this->findDocumentOrFail($id);

        return $this->respondSuccess([
            ...$document,
            'next_modules' => [
                'rastreamento' => true,
                'comprovante_entrega' => true,
            ],
            'options' => $this->buildOptions((int) $document['company_id']),
            'statusOptions' => self::STATUS_FLOW,
        ], 'Ordem de transporte carregada com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('transport_documents.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            ...$this->buildOptions($companyId),
            'statusOptions' => self::STATUS_FLOW,
        ], 'Opcoes da ordem de transporte carregadas com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('transport_documents.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TransportDocumentValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a ordem de transporte.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;
        $data['numero_ot'] = $this->generateDocumentNumber($companyId);

        $errors = $this->validateDomainRules($companyId, $data);

        if ($errors !== []) {
            return $this->respondError('Nao foi possivel salvar a ordem de transporte.', $errors, 422);
        }

        $this->documents->insert($data);
        $documentId = (int) $this->documents->getInsertID();
        $this->syncReferenceStatuses($companyId, $data);
        $this->syncHiringLink($companyId, $documentId, $data);

        return $this->respondSuccess($this->findDocumentOrFail($documentId), 'Ordem de transporte criada com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('transport_documents.update');
        $document = $this->findDocumentOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TransportDocumentValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar a ordem de transporte.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $document['company_id'];
        $data['numero_ot'] = $document['numero_ot'];

        $data['freight_hiring_id'] = $document['freight_hiring_id'] ?? null;

        $errors = $this->validateDomainRules((int) $document['company_id'], $data, $id);

        if ($errors !== []) {
            return $this->respondError('Nao foi possivel atualizar a ordem de transporte.', $errors, 422);
        }

        $this->documents->update($id, $data);
        $this->syncReferenceStatuses((int) $document['company_id'], $data);
        $this->syncHiringLink((int) $document['company_id'], $id, $data);

        return $this->respondSuccess($this->findDocumentOrFail($id), 'Ordem de transporte atualizada com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('transport_documents.delete');
        $document = $this->findDocumentOrFail($id);

        if (! empty($document['freight_hiring_id'])) {
            $this->hirings
                ->where('company_id', (int) $document['company_id'])
                ->update((int) $document['freight_hiring_id'], [
                    'transport_document_id' => null,
                    'status' => 'contratado',
                ]);
        }

        $this->documents->delete($id);
        $this->syncReferenceStatuses((int) $document['company_id'], [
            'pedido_id' => $document['pedido_id'] ?? null,
            'carga_id' => $document['carga_id'] ?? null,
            'status' => 'programada',
        ]);

        return $this->respondSuccess(null, 'Ordem de transporte excluida com sucesso.');
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
            throw PageNotFoundException::forPageNotFound('Ordem de transporte nao encontrada.');
        }

        return $document;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'carga_id',
            'pedido_id',
            'freight_hiring_id',
            'transporter_id',
            'driver_id',
            'vehicle_id',
            'data_coleta_prevista',
            'data_entrega_prevista',
            'valor_frete_contratado',
            'status',
            'observacoes',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['carga_id', 'pedido_id', 'freight_hiring_id', 'driver_id', 'vehicle_id', 'valor_frete_contratado', 'observacoes'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['status'] = $data['status'] ?: 'rascunho';

        return $data;
    }

    private function validateDomainRules(int $companyId, array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        if (empty($data['carga_id']) && empty($data['pedido_id'])) {
            $errors['referencia'] = 'Informe ao menos uma carga ou um pedido para a ordem de transporte.';
        }

        if ($data['data_entrega_prevista'] < $data['data_coleta_prevista']) {
            $errors['data_entrega_prevista'] = 'A entrega prevista deve ser igual ou posterior a coleta prevista.';
        }

        if (! $this->carriers->where('company_id', $companyId)->find((int) $data['transporter_id'])) {
            $errors['transporter_id'] = 'Selecione uma transportadora valida para a empresa atual.';
        }

        if (! empty($data['carga_id']) && ! $this->loads->where('company_id', $companyId)->find((int) $data['carga_id'])) {
            $errors['carga_id'] = 'A carga informada nao pertence a empresa atual.';
        }

        if (! empty($data['pedido_id']) && ! $this->orders->where('company_id', $companyId)->find((int) $data['pedido_id'])) {
            $errors['pedido_id'] = 'O pedido informado nao pertence a empresa atual.';
        }

        if (! empty($data['freight_hiring_id'])) {
            $hiring = $this->hirings->where('company_id', $companyId)->find((int) $data['freight_hiring_id']);

            if ($hiring === null) {
                $errors['freight_hiring_id'] = 'A contratacao informada nao pertence a empresa atual.';
            } else {
                if ((int) $hiring['transporter_id'] !== (int) $data['transporter_id']) {
                    $errors['transporter_id'] = 'A transportadora deve corresponder a contratacao vinculada.';
                }

                if ($hiring['tipo_referencia'] === 'pedido' && (int) $hiring['referencia_id'] !== (int) ($data['pedido_id'] ?? 0)) {
                    $errors['pedido_id'] = 'O pedido deve corresponder a contratacao vinculada.';
                }

                if ($hiring['tipo_referencia'] === 'carga' && (int) $hiring['referencia_id'] !== (int) ($data['carga_id'] ?? 0)) {
                    $errors['carga_id'] = 'A carga deve corresponder a contratacao vinculada.';
                }

                $duplicate = $this->documents
                    ->where('company_id', $companyId)
                    ->where('freight_hiring_id', (int) $data['freight_hiring_id']);

                if ($ignoreId !== null) {
                    $duplicate->where('id !=', $ignoreId);
                }

                if ($duplicate->first() !== null) {
                    $errors['freight_hiring_id'] = 'Ja existe uma OT vinculada a esta contratacao.';
                }
            }
        }

        if (! empty($data['driver_id'])) {
            $driver = $this->drivers->where('company_id', $companyId)->find((int) $data['driver_id']);

            if ($driver === null) {
                $errors['driver_id'] = 'Selecione um motorista valido para a empresa atual.';
            } elseif ((int) $driver['transporter_id'] !== (int) $data['transporter_id']) {
                $errors['driver_id'] = 'O motorista precisa pertencer a transportadora selecionada.';
            }
        }

        if (! empty($data['vehicle_id'])) {
            $vehicle = $this->vehicles->where('company_id', $companyId)->find((int) $data['vehicle_id']);

            if ($vehicle === null) {
                $errors['vehicle_id'] = 'Selecione um veiculo valido para a empresa atual.';
            } elseif ((int) $vehicle['transporter_id'] !== (int) $data['transporter_id']) {
                $errors['vehicle_id'] = 'O veiculo precisa pertencer a transportadora selecionada.';
            }
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

        return [
            'transporters' => $transporters->findAll(),
            'drivers' => $drivers->findAll(),
            'vehicles' => $vehicles->findAll(),
            'loads' => $this->loads
                ->select('id, codigo_carga, origem_cidade, origem_estado, destino_cidade, destino_estado, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
            'transport_orders' => $this->orders
                ->select('id, numero_pedido, cliente_nome, cidade_entrega, estado_entrega, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
        ];
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

    private function generateDocumentNumber(int $companyId): string
    {
        $datePrefix = Time::now()->format('Ymd');
        $basePrefix = sprintf('OT-%d-%s', $companyId, $datePrefix);
        $count = $this->documents
            ->where('company_id', $companyId)
            ->like('numero_ot', $basePrefix, 'after')
            ->withDeleted()
            ->countAllResults();

        return sprintf('%s-%04d', $basePrefix, $count + 1);
    }

    private function syncReferenceStatuses(int $companyId, array $data): void
    {
        if (! empty($data['pedido_id'])) {
            $status = match ($data['status']) {
                'em_coleta', 'em_transito', 'entregue' => 'em_transporte',
                'finalizada' => 'entregue',
                'cancelada' => 'cancelado',
                default => 'contratado',
            };

            $this->orders->where('company_id', $companyId)->update((int) $data['pedido_id'], ['status' => $status]);
        }

        if (! empty($data['carga_id']) && in_array($data['status'], ['em_coleta', 'em_transito'], true)) {
            $this->loads->where('company_id', $companyId)->update((int) $data['carga_id'], ['status' => 'em_transporte']);
        }

        if (! empty($data['carga_id']) && in_array($data['status'], ['entregue', 'finalizada'], true)) {
            $this->loads->where('company_id', $companyId)->update((int) $data['carga_id'], ['status' => 'entregue']);
        }

        if (! empty($data['carga_id']) && $data['status'] === 'cancelada') {
            $this->loads->where('company_id', $companyId)->update((int) $data['carga_id'], ['status' => 'cancelada']);
        }

        if (! empty($data['carga_id']) && in_array($data['status'], ['rascunho', 'programada'], true)) {
            $this->loads->where('company_id', $companyId)->update((int) $data['carga_id'], ['status' => 'pronta']);
        }
    }

    private function syncHiringLink(int $companyId, int $documentId, array $data): void
    {
        if (empty($data['freight_hiring_id'])) {
            return;
        }

        $this->hirings
            ->where('company_id', $companyId)
            ->update((int) $data['freight_hiring_id'], [
                'transport_document_id' => $documentId,
                'status' => 'convertido_em_ot',
            ]);
    }
}
