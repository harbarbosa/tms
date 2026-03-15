<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\DriverModel;
use App\Validation\DriverValidation;

class DriverController extends BaseApiController
{
    private CarrierModel $carriers;

    public function __construct(private readonly DriverModel $drivers = new DriverModel())
    {
        $this->carriers = new CarrierModel();
    }

    public function index()
    {
        $this->requirePermission('drivers.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);

        $builder = $this->drivers
            ->select('drivers.*, carriers.razao_social as transporter_razao_social, carriers.nome_fantasia as transporter_nome_fantasia')
            ->join('carriers', 'carriers.id = drivers.transporter_id')
            ->where('drivers.company_id', $companyId)
            ->orderBy('drivers.id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('drivers.nome', $search)
                ->orLike('drivers.cpf', $search)
                ->orLike('drivers.cnh', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('drivers.status', $status);
        }

        if ($transporterId > 0) {
            $builder->where('drivers.transporter_id', $transporterId);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->drivers->pager;

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
            ],
        ], 'Motoristas carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('drivers.view');
        $driver = $this->findDriverOrFail($id);

        return $this->respondSuccess($driver, 'Motorista carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('drivers.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, DriverValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o motorista.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) ($this->authContext->getCompany()['id'] ?? 0);

        if (! $this->transporterBelongsToCompany((int) $data['transporter_id'], $data['company_id'])) {
            return $this->respondError('Nao foi possivel salvar o motorista.', [
                'transporter_id' => 'Selecione uma transportadora valida para a empresa atual.',
            ], 422);
        }

        $duplicateErrors = $this->validateUniqueFields($data, $data['company_id']);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel salvar o motorista.', $duplicateErrors, 422);
        }

        $this->drivers->insert($data);
        $driver = $this->drivers->find((int) $this->drivers->getInsertID());

        return $this->respondSuccess($driver, 'Motorista criado com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('drivers.update');
        $driver = $this->findDriverOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, DriverValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o motorista.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $driver['company_id'];

        if (! $this->transporterBelongsToCompany((int) $data['transporter_id'], $data['company_id'])) {
            return $this->respondError('Nao foi possivel atualizar o motorista.', [
                'transporter_id' => 'Selecione uma transportadora valida para a empresa atual.',
            ], 422);
        }

        $duplicateErrors = $this->validateUniqueFields($data, $data['company_id'], $id);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel atualizar o motorista.', $duplicateErrors, 422);
        }

        $this->drivers->update($id, $data);

        return $this->respondSuccess($this->drivers->find($id), 'Motorista atualizado com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('drivers.delete');
        $this->findDriverOrFail($id);
        $this->drivers->delete($id);

        return $this->respondSuccess(null, 'Motorista excluido com sucesso.');
    }

    private function findDriverOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $driver = $this->drivers->where('company_id', $companyId)->find($id);

        if ($driver === null) {
            throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound('Motorista nao encontrado.');
        }

        return $driver;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'transporter_id',
            'nome',
            'cpf',
            'cnh',
            'categoria_cnh',
            'validade_cnh',
            'telefone',
            'email',
            'observacoes',
            'status',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['telefone', 'email', 'observacoes'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

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

        if ($this->drivers->existsByFieldForCompany('cpf', $data['cpf'], $companyId, $ignoreId)) {
            $errors['cpf'] = 'Ja existe um motorista com este CPF para a empresa atual.';
        }

        if ($this->drivers->existsByFieldForCompany('cnh', $data['cnh'], $companyId, $ignoreId)) {
            $errors['cnh'] = 'Ja existe um motorista com esta CNH para a empresa atual.';
        }

        return $errors;
    }
}
