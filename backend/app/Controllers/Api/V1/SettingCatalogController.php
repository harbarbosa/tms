<?php

namespace App\Controllers\Api\V1;

use App\Models\SystemCatalogItemModel;
use App\Services\SystemCatalogService;
use App\Validation\SystemCatalogValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class SettingCatalogController extends BaseApiController
{
    public function __construct(
        private readonly SystemCatalogItemModel $catalogs = new SystemCatalogItemModel(),
        private readonly SystemCatalogService $catalogService = new SystemCatalogService()
    ) {
    }

    public function options()
    {
        $this->requirePermission('settings.view');

        return $this->respondSuccess([
            'catalogTypes' => array_map(
                static fn (string $key, array $definition): array => [
                    'key' => $key,
                    ...$definition,
                ],
                array_keys($this->catalogService->definitions()),
                array_values($this->catalogService->definitions())
            ),
            'scopes' => [
                ['value' => 'company', 'label' => 'Empresa'],
                ['value' => 'global', 'label' => 'Global'],
            ],
            'statusOptions' => ['active', 'inactive'],
        ], 'Opcoes de catalogos carregadas com sucesso.');
    }

    public function index()
    {
        $this->requirePermission('settings.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $catalogType = trim((string) ($this->request->getGet('catalog_type') ?? ''));
        $scope = trim((string) ($this->request->getGet('scope') ?? 'company'));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $search = trim((string) ($this->request->getGet('search') ?? ''));

        $builder = $this->catalogs
            ->where('catalog_type !=', '');

        if ($catalogType !== '') {
            $builder->where('catalog_type', $catalogType);
        }

        if ($scope === 'global') {
            $builder->where('scope', 'global')->where('company_id', null);
        } else {
            $builder->where('scope', 'company')->where('company_id', $companyId);
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        if ($search !== '') {
            $builder->groupStart()
                ->like('label', $search)
                ->orLike('code', $search)
                ->orLike('description', $search)
                ->groupEnd();
        }

        $builder->orderBy('catalog_type', 'ASC')->orderBy('sort_order', 'ASC')->orderBy('label', 'ASC');
        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->catalogs->pager;

        return $this->respondSuccess([
            'items' => $items,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'pageCount' => $pager->getPageCount(),
            ],
            'filters' => [
                'catalog_type' => $catalogType,
                'scope' => $scope,
                'status' => $status,
                'search' => $search,
            ],
        ], 'Catalogos carregados com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('settings.manage');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, SystemCatalogValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o item do catalogo.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload, $companyId);
        $errors = $this->validateScopeAndUniqueness($data);

        if ($errors !== []) {
          return $this->respondError('Nao foi possivel salvar o item do catalogo.', $errors, 422);
        }

        $this->catalogs->insert($data);

        return $this->respondSuccess($this->findOrFail((int) $this->catalogs->getInsertID(), $companyId), 'Item de catalogo criado com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('settings.manage');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, SystemCatalogValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o item do catalogo.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $current = $this->findOrFail($id, $companyId);
        $data = $this->sanitizePayload($payload, $companyId, $current);
        $errors = $this->validateScopeAndUniqueness($data, $id);

        if ($errors !== []) {
            return $this->respondError('Nao foi possivel atualizar o item do catalogo.', $errors, 422);
        }

        $this->catalogs->update($id, $data);

        return $this->respondSuccess($this->findOrFail($id, $companyId), 'Item de catalogo atualizado com sucesso.');
    }

    public function updateStatus(int $id)
    {
        $this->requirePermission('settings.manage');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $current = $this->findOrFail($id, $companyId);
        $payload = $this->request->getJSON(true) ?? [];
        $status = trim((string) ($payload['status'] ?? ''));

        if (! in_array($status, ['active', 'inactive'], true)) {
            return $this->respondError('Nao foi possivel atualizar o status do item.', [
                'status' => 'Informe um status valido.',
            ], 422);
        }

        $this->catalogs->update($id, ['status' => $status]);

        return $this->respondSuccess($this->findOrFail($id, $companyId), 'Status do item atualizado com sucesso.');
    }

    private function sanitizePayload(array $payload, int $companyId, ?array $current = null): array
    {
        $scope = trim((string) ($payload['scope'] ?? 'company'));

        return [
            'scope' => $scope,
            'company_id' => $scope === 'global' ? null : ($current['company_id'] ?? $companyId),
            'catalog_type' => trim((string) ($payload['catalog_type'] ?? '')),
            'code' => trim((string) ($payload['code'] ?? '')),
            'label' => trim((string) ($payload['label'] ?? '')),
            'description' => trim((string) ($payload['description'] ?? '')) ?: null,
            'sort_order' => (int) ($payload['sort_order'] ?? 0),
            'status' => trim((string) ($payload['status'] ?? 'active')) ?: 'active',
            'metadata_json' => null,
        ];
    }

    private function validateScopeAndUniqueness(array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        if ($data['scope'] === 'global' && $this->getCurrentRole() !== 'master_admin') {
            $errors['scope'] = 'Apenas o administrador master pode manter catalogos globais.';
        }

        if (! array_key_exists($data['catalog_type'], $this->catalogService->definitions())) {
            $errors['catalog_type'] = 'Tipo de catalogo invalido.';
        }

        $builder = $this->catalogs
            ->where('scope', $data['scope'])
            ->where('company_id', $data['company_id'])
            ->where('catalog_type', $data['catalog_type'])
            ->where('code', $data['code']);

        if ($ignoreId !== null) {
            $builder->where('id !=', $ignoreId);
        }

        if ($builder->first() !== null) {
            $errors['code'] = 'Ja existe um item com esse codigo nesse catalogo.';
        }

        return $errors;
    }

    private function findOrFail(int $id, int $companyId): array
    {
        $builder = $this->catalogs->where('id', $id);

        if ($this->getCurrentRole() !== 'master_admin') {
            $builder->groupStart()
                ->where('scope', 'company')
                ->where('company_id', $companyId)
                ->groupEnd();
        }

        $item = $builder->first();

        if ($item === null) {
            throw PageNotFoundException::forPageNotFound('Item de catalogo nao encontrado.');
        }

        return $item;
    }
}
