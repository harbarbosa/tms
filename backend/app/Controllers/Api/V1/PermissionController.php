<?php

namespace App\Controllers\Api\V1;

use App\Models\RoleModel;
use App\Services\PermissionMatrixService;
use CodeIgniter\Exceptions\PageNotFoundException;

class PermissionController extends BaseApiController
{
    public function __construct(
        private readonly PermissionMatrixService $matrix = new PermissionMatrixService(),
        private readonly RoleModel $roles = new RoleModel(),
    )
    {
    }

    public function matrix()
    {
        $this->ensurePermissionReadAccess();
        $roleId = (int) ($this->request->getGet('role_id') ?? 0);
        $module = trim((string) ($this->request->getGet('module') ?? ''));

        return $this->respondSuccess(
            $this->matrix->buildMatrix($roleId > 0 ? $roleId : null, $module),
            'Matriz de permissoes carregada com sucesso.'
        );
    }

    public function saveRolePermissions(int $roleId)
    {
        $this->requirePermission('permissions.manage');
        $role = $this->roles->find($roleId);

        if ($role === null) {
            throw PageNotFoundException::forPageNotFound('Perfil nao encontrado.');
        }

        $payload = $this->request->getJSON(true) ?? [];
        $permissionIds = array_values(array_unique(array_map('intval', $payload['permission_ids'] ?? [])));

        return $this->respondSuccess(
            $this->matrix->syncRolePermissions($roleId, $permissionIds),
            'Permissoes do perfil salvas com sucesso.'
        );
    }

    private function ensurePermissionReadAccess(): void
    {
        if (! $this->hasPermission('permissions.view') && ! $this->hasPermission('permissions.manage')) {
            $this->requirePermission('permissions.view');
        }
    }
}
