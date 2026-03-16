<?php

namespace App\Services;

use App\Models\RoleModel;
use App\Models\RolePermissionModel;

class RoleManagementService
{
    private RoleModel $roles;

    private RolePermissionModel $rolePermissions;

    public function __construct()
    {
        $this->roles = new RoleModel();
        $this->rolePermissions = new RolePermissionModel();
    }

    public function buildRoleDetails(array $role): array
    {
        $permissionIds = $this->rolePermissions
            ->select('permission_id')
            ->where('role_id', (int) $role['id'])
            ->findColumn('permission_id') ?: [];

        return [
            'id' => (int) $role['id'],
            'name' => $role['name'],
            'description' => $role['description'],
            'scope' => $role['scope'] ?? 'global',
            'status' => $role['status'] ?? 'active',
            'is_system' => (bool) ($role['is_system'] ?? false),
            'permission_count' => count($permissionIds),
            'permission_ids' => array_map('intval', $permissionIds),
            'created_at' => $role['created_at'] ?? null,
            'updated_at' => $role['updated_at'] ?? null,
        ];
    }

    public function duplicateRole(int $sourceRoleId, array $payload): array
    {
        $source = $this->roles->find($sourceRoleId);
        $data = [
            'name' => $payload['name'],
            'slug' => $payload['slug'],
            'description' => $payload['description'] ?? $source['description'],
            'scope' => $payload['scope'] ?? ($source['scope'] ?? 'global'),
            'status' => $payload['status'] ?? 'active',
            'is_system' => 0,
        ];

        $this->roles->insert($data);
        $newRoleId = (int) $this->roles->getInsertID();

        $permissionIds = $this->rolePermissions
            ->select('permission_id')
            ->where('role_id', $sourceRoleId)
            ->findColumn('permission_id') ?: [];

        foreach ($permissionIds as $permissionId) {
            $this->rolePermissions->insert([
                'role_id' => $newRoleId,
                'permission_id' => (int) $permissionId,
            ]);
        }

        return $this->buildRoleDetails($this->roles->find($newRoleId));
    }
}
