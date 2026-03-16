<?php

namespace App\Controllers\Api\V1;

use App\Models\CompanyModel;
use App\Validation\CompanyValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class CompanyController extends BaseApiController
{
    public function __construct(private readonly CompanyModel $companies = new CompanyModel())
    {
    }

    public function index()
    {
        $this->requirePermission('companies.view');
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $tipoEmpresa = trim((string) ($this->request->getGet('tipo_empresa') ?? ''));
        $cidade = trim((string) ($this->request->getGet('cidade') ?? ''));

        $builder = $this->companies
            ->select('id, uuid, slug, razao_social, nome_fantasia, cnpj, email, telefone, cidade, estado, status, tipo_empresa, limite_usuarios, limite_transportadoras, limite_veiculos, limite_motoristas, created_at, updated_at')
            ->orderBy('id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('razao_social', $search)
                ->orLike('nome_fantasia', $search)
                ->orLike('cnpj', $search)
                ->orLike('email', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        if ($tipoEmpresa !== '') {
            $builder->where('tipo_empresa', $tipoEmpresa);
        }

        if ($cidade !== '') {
            $builder->like('cidade', $cidade);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->companies->pager;

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
                'tipo_empresa' => $tipoEmpresa,
                'cidade' => $cidade,
            ],
        ], 'Empresas carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('companies.view');

        return $this->respondSuccess($this->findCompanyOrFail($id), 'Empresa carregada com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('companies.manage');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, CompanyValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a empresa.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $duplicateErrors = $this->validateUniqueFields($data);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel salvar a empresa.', $duplicateErrors, 422);
        }

        $this->companies->insert($data);
        $company = $this->companies->find((int) $this->companies->getInsertID());

        return $this->respondSuccess($company, 'Empresa criada com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('companies.manage');
        $this->findCompanyOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, CompanyValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar a empresa.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $duplicateErrors = $this->validateUniqueFields($data, $id);

        if ($duplicateErrors !== []) {
            return $this->respondError('Nao foi possivel atualizar a empresa.', $duplicateErrors, 422);
        }

        $this->companies->update($id, $data);

        return $this->respondSuccess($this->companies->find($id), 'Empresa atualizada com sucesso.');
    }

    public function updateStatus(int $id)
    {
        $this->requirePermission('companies.manage');
        $company = $this->findCompanyOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $status = trim((string) ($payload['status'] ?? ''));

        if (! in_array($status, ['active', 'inactive'], true)) {
            return $this->respondError('Nao foi possivel atualizar o status da empresa.', [
                'status' => 'Selecione um status valido.',
            ], 422);
        }

        $this->companies->update($id, ['status' => $status]);

        return $this->respondSuccess(
            $this->companies->find($id),
            $status === 'active' ? 'Empresa ativada com sucesso.' : 'Empresa inativada com sucesso.'
        );
    }

    private function findCompanyOrFail(int $id): array
    {
        $company = $this->companies->find($id);

        if ($company === null) {
            throw PageNotFoundException::forPageNotFound('Empresa nao encontrada.');
        }

        return $company;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'razao_social',
            'nome_fantasia',
            'cnpj',
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
            'tipo_empresa',
            'limite_usuarios',
            'limite_transportadoras',
            'limite_veiculos',
            'limite_motoristas',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach ([
            'nome_fantasia',
            'cnpj',
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
        $data['tipo_empresa'] = $data['tipo_empresa'] ?: 'embarcador';
        $data['limite_usuarios'] = (int) ($data['limite_usuarios'] ?? 10);
        $data['limite_transportadoras'] = (int) ($data['limite_transportadoras'] ?? 10);
        $data['limite_veiculos'] = (int) ($data['limite_veiculos'] ?? 50);
        $data['limite_motoristas'] = (int) ($data['limite_motoristas'] ?? 50);

        // Mantem compatibilidade com a base legada usada no contexto de autenticacao.
        $data['name'] = $data['nome_fantasia'] ?: $data['razao_social'];
        $data['legal_name'] = $data['razao_social'];
        $data['tax_id'] = $data['cnpj'];
        $data['slug'] = $this->buildSlug($data['name']);
        $data['settings'] = $payload['settings'] ?? null;

        if (! isset($payload['uuid']) || empty($payload['uuid'])) {
            $data['uuid'] = $this->generateUuid();
        }

        return $data;
    }

    private function validateUniqueFields(array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        if (! empty($data['cnpj']) && $this->companies->existsByField('cnpj', $data['cnpj'], $ignoreId)) {
            $errors['cnpj'] = 'Ja existe uma empresa com este CNPJ.';
        }

        if (! empty($data['slug']) && $this->companies->existsByField('slug', $data['slug'], $ignoreId)) {
            $errors['nome_fantasia'] = 'Ja existe uma empresa com este nome de exibicao. Ajuste o nome fantasia.';
        }

        return $errors;
    }

    private function buildSlug(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized) ?: $normalized;
        $normalized = preg_replace('/[^a-z0-9]+/', '-', $normalized) ?: 'empresa';

        return trim($normalized, '-');
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
