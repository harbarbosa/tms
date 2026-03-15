<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\VehicleModel;
use App\Validation\VehicleValidation;

class VehicleController extends BaseApiController
{
    private CarrierModel $carriers;

    public function __construct(private readonly VehicleModel $vehicles = new VehicleModel())
    {
        $this->carriers = new CarrierModel();
    }

    public function index()
    {
        $this->requirePermission('vehicles.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);
        $vehicleType = trim((string) ($this->request->getGet('tipo_veiculo') ?? ''));

        $builder = $this->vehicles
            ->select('vehicles.*, carriers.razao_social as transporter_razao_social, carriers.nome_fantasia as transporter_nome_fantasia')
            ->join('carriers', 'carriers.id = vehicles.transporter_id')
            ->where('vehicles.company_id', $companyId)
            ->orderBy('vehicles.id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('vehicles.placa', $search)
                ->orLike('vehicles.renavam', $search)
                ->orLike('vehicles.tipo_veiculo', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('vehicles.status', $status);
        }

        if ($transporterId > 0) {
            $builder->where('vehicles.transporter_id', $transporterId);
        }

        if ($vehicleType !== '') {
            $builder->where('vehicles.tipo_veiculo', $vehicleType);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->vehicles->pager;

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
                'tipo_veiculo' => $vehicleType,
            ],
        ], 'Veiculos carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('vehicles.view');
        $vehicle = $this->findVehicleOrFail($id);

        return $this->respondSuccess($vehicle, 'Veiculo carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('vehicles.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, VehicleValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o veiculo.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) ($this->authContext->getCompany()['id'] ?? 0);

        if (! $this->transporterBelongsToCompany((int) $data['transporter_id'], $data['company_id'])) {
            return $this->respondError('Nao foi possivel salvar o veiculo.', [
                'transporter_id' => 'Selecione uma transportadora valida para a empresa atual.',
            ], 422);
        }

        $duplicateErrors = $this->validateUniqueFields($data, $data['company_id']);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel salvar o veiculo.', $duplicateErrors, 422);
        }

        $this->vehicles->insert($data);
        $vehicle = $this->vehicles->find((int) $this->vehicles->getInsertID());

        return $this->respondSuccess($vehicle, 'Veiculo criado com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('vehicles.update');
        $vehicle = $this->findVehicleOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, VehicleValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o veiculo.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $vehicle['company_id'];

        if (! $this->transporterBelongsToCompany((int) $data['transporter_id'], $data['company_id'])) {
            return $this->respondError('Nao foi possivel atualizar o veiculo.', [
                'transporter_id' => 'Selecione uma transportadora valida para a empresa atual.',
            ], 422);
        }

        $duplicateErrors = $this->validateUniqueFields($data, $data['company_id'], $id);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel atualizar o veiculo.', $duplicateErrors, 422);
        }

        $this->vehicles->update($id, $data);

        return $this->respondSuccess($this->vehicles->find($id), 'Veiculo atualizado com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('vehicles.delete');
        $this->findVehicleOrFail($id);
        $this->vehicles->delete($id);

        return $this->respondSuccess(null, 'Veiculo excluido com sucesso.');
    }

    private function findVehicleOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $vehicle = $this->vehicles->where('company_id', $companyId)->find($id);

        if ($vehicle === null) {
            throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound('Veiculo nao encontrado.');
        }

        return $vehicle;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'transporter_id',
            'placa',
            'renavam',
            'tipo_veiculo',
            'tipo_carroceria',
            'capacidade_peso',
            'capacidade_volume',
            'ano_modelo',
            'status',
            'observacoes',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach ([
            'renavam',
            'tipo_carroceria',
            'capacidade_peso',
            'capacidade_volume',
            'ano_modelo',
            'observacoes',
        ] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['placa'] = strtoupper(preg_replace('/[^A-Z0-9]/i', '', (string) $data['placa']) ?? '');
        $data['tipo_veiculo'] = strtoupper((string) $data['tipo_veiculo']);
        $data['tipo_carroceria'] = $data['tipo_carroceria'] ? strtoupper((string) $data['tipo_carroceria']) : null;
        $data['status'] = $data['status'] ?: 'active';

        return $data;
    }

    private function transporterBelongsToCompany(int $transporterId, int $companyId): bool
    {
        return $this->carriers
            ->where('company_id', $companyId)
            ->find($transporterId) !== null;
    }

    private function validateUniqueFields(array $data, int $companyId, ?int $ignoreId = null): array
    {
        $errors = [];

        if ($this->vehicles->existsByFieldForCompany('placa', $data['placa'], $companyId, $ignoreId)) {
            $errors['placa'] = 'Ja existe um veiculo com esta placa para a empresa atual.';
        }

        if (! empty($data['renavam']) && $this->vehicles->existsByFieldForCompany('renavam', $data['renavam'], $companyId, $ignoreId)) {
            $errors['renavam'] = 'Ja existe um veiculo com este RENAVAM para a empresa atual.';
        }

        return $errors;
    }
}
