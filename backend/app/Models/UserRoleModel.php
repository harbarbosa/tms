<?php

namespace App\Models;

use CodeIgniter\Model;

class UserRoleModel extends Model
{
    protected $table = 'user_roles';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'user_id',
        'role_id',
        'company_id',
    ];

    protected $useTimestamps = true;

    protected $dateFormat = 'datetime';

    protected $createdField = 'created_at';

    protected $updatedField = 'updated_at';

    public function findPrimaryRoleForUserCompany(int $userId, int $companyId): ?array
    {
        return $this->select('roles.id, roles.name, roles.slug')
            ->join('roles', 'roles.id = user_roles.role_id')
            ->where('user_roles.user_id', $userId)
            ->groupStart()
                ->where('user_roles.company_id', $companyId)
                ->orWhere('user_roles.company_id', null)
            ->groupEnd()
            ->where('roles.deleted_at', null)
            ->where('roles.status', 'active')
            ->orderBy('user_roles.company_id', 'DESC')
            ->first();
    }

    public function findPermissionSlugsForUserCompany(int $userId, int $companyId): array
    {
        $rows = $this->select('permissions.slug')
            ->join('roles', 'roles.id = user_roles.role_id')
            ->join('role_permissions', 'role_permissions.role_id = roles.id')
            ->join('permissions', 'permissions.id = role_permissions.permission_id')
            ->where('user_roles.user_id', $userId)
            ->groupStart()
                ->where('user_roles.company_id', $companyId)
                ->orWhere('user_roles.company_id', null)
            ->groupEnd()
            ->where('roles.deleted_at', null)
            ->where('roles.status', 'active')
            ->where('permissions.deleted_at', null)
            ->findAll();

        return array_values(array_unique(array_map(
            static fn (array $row): string => $row['slug'],
            $rows
        )));
    }

    public function findRolesForUser(int $userId): array
    {
        return $this->select('roles.id, roles.name, roles.slug, roles.scope, roles.status, roles.is_system, user_roles.company_id')
            ->join('roles', 'roles.id = user_roles.role_id')
            ->where('user_roles.user_id', $userId)
            ->where('roles.deleted_at', null)
            ->orderBy('roles.name', 'ASC')
            ->findAll();
    }

    public function syncUserRolesForCompany(int $userId, array $roleIds, int $companyId): void
    {
        $roleIds = array_values(array_unique(array_map('intval', $roleIds)));

        $this->where('user_id', $userId)->delete();

        foreach ($roleIds as $roleId) {
            $this->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'company_id' => $companyId,
            ]);
        }
    }
}
