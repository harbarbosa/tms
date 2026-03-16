<?php

namespace App\Services;

use App\Models\RoleModel;
use App\Models\UserCompanyModel;
use App\Models\UserModel;
use App\Models\UserRoleModel;
use RuntimeException;

class UserManagementService
{
    private UserModel $users;

    private UserCompanyModel $userCompanies;

    private UserRoleModel $userRoles;

    private RoleModel $roles;

    public function __construct()
    {
        $this->users = new UserModel();
        $this->userCompanies = new UserCompanyModel();
        $this->userRoles = new UserRoleModel();
        $this->roles = new RoleModel();
    }

    public function buildUserDetails(array $user): array
    {
        $companies = $this->userCompanies->findCompaniesForUser((int) $user['id']);
        $roles = $this->userRoles->findRolesForUser((int) $user['id']);

        $primaryCompany = null;
        foreach ($companies as $company) {
            if ((int) ($company['is_default'] ?? 0) === 1) {
                $primaryCompany = $company;
                break;
            }
        }

        $primaryRole = $roles[0] ?? null;

        return [
            'id' => (int) $user['id'],
            'uuid' => $user['uuid'] ?? null,
            'name' => $user['name'] ?? null,
            'email' => $user['email'] ?? null,
            'telefone' => $user['telefone'] ?? null,
            'status' => $user['status'] ?? null,
            'carrier_id' => isset($user['carrier_id']) ? (int) $user['carrier_id'] : null,
            'driver_id' => isset($user['driver_id']) ? (int) $user['driver_id'] : null,
            'last_login_at' => $user['last_login_at'] ?? null,
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null,
            'primary_company_id' => $primaryCompany['id'] ?? null,
            'company_ids' => array_map(static fn (array $company): int => (int) $company['id'], $companies),
            'companies' => array_map(static function (array $company): array {
                return [
                    'id' => (int) $company['id'],
                    'name' => $company['nome_fantasia'] ?: $company['razao_social'] ?: $company['name'],
                    'is_default' => (bool) ($company['is_default'] ?? false),
                ];
            }, $companies),
            'primary_role_id' => $primaryRole['id'] ?? null,
            'role_ids' => array_values(array_unique(array_map(static fn (array $role): int => (int) $role['id'], $roles))),
            'roles' => array_map(static function (array $role): array {
                return [
                    'id' => (int) $role['id'],
                    'name' => $role['name'],
                    'slug' => $role['slug'],
                    'company_id' => $role['company_id'] !== null ? (int) $role['company_id'] : null,
                ];
            }, $roles),
        ];
    }

    public function syncRelationships(int $userId, int $primaryCompanyId, array $companyIds, int $primaryRoleId, array $roleIds): void
    {
        $companyIds = array_values(array_unique(array_map('intval', array_merge($companyIds, [$primaryCompanyId]))));
        $roleIds = array_values(array_unique(array_map('intval', array_merge($roleIds, [$primaryRoleId]))));

        $orderedRoleIds = array_values(array_unique(array_merge([$primaryRoleId], $roleIds)));

        $this->userCompanies->syncUserCompanies($userId, $companyIds, $primaryCompanyId);
        $this->userRoles->syncUserRolesForCompany($userId, $orderedRoleIds, $primaryCompanyId);
    }

    public function resetPassword(int $userId): string
    {
        $temporaryPassword = $this->generateTemporaryPassword();

        $updated = $this->users->update($userId, [
            'password_hash' => password_hash($temporaryPassword, PASSWORD_DEFAULT),
        ]);

        if (! $updated) {
            throw new RuntimeException('Nao foi possivel redefinir a senha do usuario.');
        }

        return $temporaryPassword;
    }

    public function getRoleOptions(): array
    {
        return $this->roles
            ->select('id, name, slug, scope, status')
            ->where('status', 'active')
            ->orderBy('name', 'ASC')
            ->findAll();
    }

    private function generateTemporaryPassword(): string
    {
        return 'TMS' . random_int(100000, 999999);
    }
}
