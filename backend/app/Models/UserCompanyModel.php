<?php

namespace App\Models;

use CodeIgniter\Model;

class UserCompanyModel extends Model
{
    protected $table = 'user_companies';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'user_id',
        'company_id',
        'is_default',
        'is_active',
    ];

    protected $useTimestamps = true;

    protected $dateFormat = 'datetime';

    protected $createdField = 'created_at';

    protected $updatedField = 'updated_at';

    public function findDefaultCompanyForUser(int $userId): ?array
    {
        return $this->select('companies.*')
            ->join('companies', 'companies.id = user_companies.company_id')
            ->where('user_companies.user_id', $userId)
            ->where('user_companies.is_default', 1)
            ->where('user_companies.is_active', 1)
            ->where('companies.deleted_at', null)
            ->first();
    }

    public function findCompanyForUser(int $userId, int $companyId): ?array
    {
        return $this->select('companies.*')
            ->join('companies', 'companies.id = user_companies.company_id')
            ->where('user_companies.user_id', $userId)
            ->where('user_companies.company_id', $companyId)
            ->where('user_companies.is_active', 1)
            ->where('companies.deleted_at', null)
            ->first();
    }

    public function findCompaniesForUser(int $userId): array
    {
        return $this->select('companies.id, companies.name, companies.razao_social, companies.nome_fantasia, user_companies.is_default, user_companies.is_active')
            ->join('companies', 'companies.id = user_companies.company_id')
            ->where('user_companies.user_id', $userId)
            ->where('companies.deleted_at', null)
            ->orderBy('user_companies.is_default', 'DESC')
            ->orderBy('companies.name', 'ASC')
            ->findAll();
    }

    public function syncUserCompanies(int $userId, array $companyIds, int $defaultCompanyId): void
    {
        $companyIds = array_values(array_unique(array_map('intval', $companyIds)));

        $this->where('user_id', $userId)->delete();

        foreach ($companyIds as $companyId) {
            $this->insert([
                'user_id' => $userId,
                'company_id' => $companyId,
                'is_default' => $companyId === $defaultCompanyId ? 1 : 0,
                'is_active' => 1,
            ]);
        }
    }
}
