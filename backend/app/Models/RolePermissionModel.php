<?php

namespace App\Models;

use CodeIgniter\Model;

class RolePermissionModel extends Model
{
    protected $table = 'role_permissions';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'role_id',
        'permission_id',
    ];

    protected $useTimestamps = true;

    protected $dateFormat = 'datetime';

    protected $createdField = 'created_at';

    protected $updatedField = 'updated_at';

    public function syncPermissionsForRole(int $roleId, array $permissionIds): void
    {
        $permissionIds = array_values(array_unique(array_map('intval', $permissionIds)));

        $this->where('role_id', $roleId)->delete();

        foreach ($permissionIds as $permissionId) {
            $this->insert([
                'role_id' => $roleId,
                'permission_id' => $permissionId,
            ]);
        }
    }
}
