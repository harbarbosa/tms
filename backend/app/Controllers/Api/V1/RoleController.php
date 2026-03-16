<?php

namespace App\Controllers\Api\V1;

use App\Models\RoleModel;
use App\Services\RoleManagementService;
use App\Validation\RoleValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class RoleController extends BaseApiController
{
    public function __construct(
        private readonly RoleModel $roles = new RoleModel(),
        private readonly RoleManagementService $management = new RoleManagementService(),
    )
    {
    }

    public function index()
    {
        $this->ensureRoleReadAccess();
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $scope = trim((string) ($this->request->getGet('scope') ?? ''));

        $builder = $this->roles
            ->select('id, name, slug, description, scope, status, is_system, created_at, updated_at')
            ->orderBy('id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('name', $search)
                ->orLike('description', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        if ($scope !== '') {
            $builder->where('scope', $scope);
        }

        $total = $builder->countAllResults(false);
        $items = array_map(
            fn (array $role): array => $this->management->buildRoleDetails($role),
            $builder->paginate($perPage, 'default', $page)
        );
        $pager = $this->roles->pager;

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
                'scope' => $scope,
            ],
        ], 'Perfis carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->ensureRoleReadAccess();

        return $this->respondSuccess(
            $this->management->buildRoleDetails($this->findRoleOrFail($id)),
            'Perfil carregado com sucesso.'
        );
    }

    public function create()
    {
        $this->requirePermission('roles.manage');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, RoleValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o perfil.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);

        if ($this->roles->existsBySlug($data['slug'])) {
            return $this->respondError('Nao foi possivel salvar o perfil.', [
                'name' => 'Ja existe um perfil com este nome.',
            ], 422);
        }

        $this->roles->insert($data);

        return $this->respondSuccess(
            $this->management->buildRoleDetails($this->roles->find((int) $this->roles->getInsertID())),
            'Perfil criado com sucesso.',
            201
        );
    }

    public function update(int $id)
    {
        $this->requirePermission('roles.manage');
        $role = $this->findRoleOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, RoleValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o perfil.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload, $role);

        if ($this->roles->existsBySlug($data['slug'], $id)) {
            return $this->respondError('Nao foi possivel atualizar o perfil.', [
                'name' => 'Ja existe um perfil com este nome.',
            ], 422);
        }

        $this->roles->update($id, $data);

        return $this->respondSuccess(
            $this->management->buildRoleDetails($this->roles->find($id)),
            'Perfil atualizado com sucesso.'
        );
    }

    public function updateStatus(int $id)
    {
        $this->requirePermission('roles.manage');
        $this->findRoleOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $status = trim((string) ($payload['status'] ?? ''));

        if (! in_array($status, ['active', 'inactive'], true)) {
            return $this->respondError('Nao foi possivel atualizar o status do perfil.', [
                'status' => 'Selecione um status valido.',
            ], 422);
        }

        $this->roles->update($id, ['status' => $status]);

        return $this->respondSuccess(
            $this->management->buildRoleDetails($this->roles->find($id)),
            $status === 'active' ? 'Perfil ativado com sucesso.' : 'Perfil inativado com sucesso.'
        );
    }

    public function duplicate(int $id)
    {
        $this->requirePermission('roles.manage');
        $role = $this->findRoleOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $name = trim((string) ($payload['name'] ?? ''));

        if ($name === '') {
            return $this->respondError('Nao foi possivel duplicar o perfil.', [
                'name' => 'Informe o nome do novo perfil.',
            ], 422);
        }

        $slug = $this->buildSlug($name);

        if ($this->roles->existsBySlug($slug)) {
            return $this->respondError('Nao foi possivel duplicar o perfil.', [
                'name' => 'Ja existe um perfil com este nome.',
            ], 422);
        }

        $duplicated = $this->management->duplicateRole($id, [
            'name' => $name,
            'slug' => $slug,
            'description' => trim((string) ($payload['description'] ?? '')) ?: ($role['description'] ?? null),
            'scope' => trim((string) ($payload['scope'] ?? '')) ?: ($role['scope'] ?? 'global'),
            'status' => trim((string) ($payload['status'] ?? 'active')) ?: 'active',
        ]);

        return $this->respondSuccess($duplicated, 'Perfil duplicado com sucesso.', 201);
    }

    private function findRoleOrFail(int $id): array
    {
        $role = $this->roles->find($id);

        if ($role === null) {
            throw PageNotFoundException::forPageNotFound('Perfil nao encontrado.');
        }

        return $role;
    }

    private function sanitizePayload(array $payload, ?array $existingRole = null): array
    {
        $name = trim((string) ($payload['name'] ?? ''));

        return [
            'name' => $name,
            'slug' => $existingRole['slug'] ?? $this->buildSlug($name),
            'description' => trim((string) ($payload['description'] ?? '')) ?: null,
            'scope' => trim((string) ($payload['scope'] ?? 'global')) ?: 'global',
            'status' => trim((string) ($payload['status'] ?? 'active')) ?: 'active',
            'is_system' => (int) ($existingRole['is_system'] ?? 0),
        ];
    }

    private function buildSlug(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized) ?: $normalized;
        $normalized = preg_replace('/[^a-z0-9]+/', '-', $normalized) ?: 'perfil';

        return trim($normalized, '-');
    }

    private function ensureRoleReadAccess(): void
    {
        if (! $this->hasPermission('roles.view') && ! $this->hasPermission('roles.manage')) {
            $this->requirePermission('roles.view');
        }
    }
}
