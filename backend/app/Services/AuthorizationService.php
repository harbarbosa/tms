<?php

namespace App\Services;

use App\Models\PermissionModel;
use App\Models\UserRoleModel;

class AuthorizationService
{
    private UserRoleModel $userRoles;

    private PermissionModel $permissions;

    public function __construct()
    {
        $this->userRoles = new UserRoleModel();
        $this->permissions = new PermissionModel();
    }

    public function buildAccessProfile(array $user, array $company): array
    {
        $role = $this->userRoles->findPrimaryRoleForUserCompany((int) $user['id'], (int) $company['id']);
        $permissions = $this->userRoles->findPermissionSlugsForUserCompany((int) $user['id'], (int) $company['id']);

        return [
            'role' => $role ? [
                'id' => (int) $role['id'],
                'name' => $role['name'],
                'slug' => $role['slug'],
            ] : null,
            'permissions' => array_values(array_unique($permissions)),
            'scope' => [
                'company_id' => (int) $company['id'],
                'carrier_id' => isset($user['carrier_id']) ? (int) $user['carrier_id'] : null,
                'driver_id' => isset($user['driver_id']) ? (int) $user['driver_id'] : null,
            ],
        ];
    }

    public function hasPermission(array $access, string $permission): bool
    {
        $permissions = $access['permissions'] ?? [];

        return in_array($permission, $permissions, true);
    }

    public function getPermissionCatalog(): array
    {
        return $this->permissions
            ->select('id, name, slug, module, description')
            ->orderBy('module', 'ASC')
            ->orderBy('name', 'ASC')
            ->findAll();
    }
}
