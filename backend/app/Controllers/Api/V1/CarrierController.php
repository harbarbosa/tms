<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Validation\CarrierValidation;

class CarrierController extends BaseApiController
{
    public function __construct(private readonly CarrierModel $carriers = new CarrierModel())
    {
    }

    public function index()
    {
        $this->requirePermission('carriers.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));

        $builder = $this->carriers
            ->where('company_id', $companyId)
            ->orderBy('id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('razao_social', $search)
                ->orLike('nome_fantasia', $search)
                ->orLike('cnpj', $search)
                ->orLike('cidade', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->carriers->pager;

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
        ], 'Transportadoras carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('carriers.view');
        $carrier = $this->findCarrierOrFail($id);

        return $this->respondSuccess($carrier, 'Transportadora carregada com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('carriers.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, CarrierValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a transportadora.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) ($this->authContext->getCompany()['id'] ?? 0);

        $duplicateErrors = $this->validateUniqueFields($data, $data['company_id']);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel salvar a transportadora.', $duplicateErrors, 422);
        }

        $this->carriers->insert($data);
        $carrier = $this->carriers->find((int) $this->carriers->getInsertID());

        return $this->respondSuccess($carrier, 'Transportadora criada com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('carriers.update');
        $carrier = $this->findCarrierOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, CarrierValidation::rules($id))) {
            return $this->respondError('Nao foi possivel atualizar a transportadora.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $carrier['company_id'];

        $duplicateErrors = $this->validateUniqueFields($data, $data['company_id'], $id);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel atualizar a transportadora.', $duplicateErrors, 422);
        }

        $this->carriers->update($id, $data);

        return $this->respondSuccess($this->carriers->find($id), 'Transportadora atualizada com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('carriers.delete');
        $this->findCarrierOrFail($id);
        $this->carriers->delete($id);

        return $this->respondSuccess(null, 'Transportadora excluida com sucesso.');
    }

    private function findCarrierOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $carrier = $this->carriers
            ->where('company_id', $companyId)
            ->find($id);

        if ($carrier === null) {
            throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound('Transportadora nao encontrada.');
        }

        return $carrier;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'razao_social',
            'nome_fantasia',
            'cnpj',
            'antt',
            'email',
            'telefone',
            'cep',
            'endereco',
            'numero',
            'complemento',
            'bairro',
            'cidade',
            'estado',
            'status',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach ([
            'nome_fantasia',
            'cnpj',
            'antt',
            'email',
            'telefone',
            'cep',
            'endereco',
            'numero',
            'complemento',
            'bairro',
            'cidade',
            'estado',
        ] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['estado'] = $data['estado'] ? strtoupper((string) $data['estado']) : null;
        $data['status'] = $data['status'] ?: 'active';

        return $data;
    }

    private function validateUniqueFields(array $data, int $companyId, ?int $ignoreId = null): array
    {
        $errors = [];

        if (! empty($data['cnpj']) && $this->carriers->existsByFieldForCompany('cnpj', $data['cnpj'], $companyId, $ignoreId)) {
            $errors['cnpj'] = 'Ja existe uma transportadora com este CNPJ para a empresa atual.';
        }

        if (! empty($data['antt']) && $this->carriers->existsByFieldForCompany('antt', $data['antt'], $companyId, $ignoreId)) {
            $errors['antt'] = 'Ja existe uma transportadora com este ANTT para a empresa atual.';
        }

        return $errors;
    }
}
