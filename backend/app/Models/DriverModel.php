<?php

namespace App\Models;

class DriverModel extends BaseModel
{
    protected $table = 'drivers';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transporter_id',
        'nome',
        'cpf',
        'cnh',
        'categoria_cnh',
        'validade_cnh',
        'telefone',
        'email',
        'observacoes',
        'status',
    ];

    public function existsByFieldForCompany(string $field, string $value, int $companyId, ?int $ignoreId = null): bool
    {
        $builder = $this->where('company_id', $companyId)
            ->where($field, $value);

        if ($ignoreId !== null) {
            $builder->where('id !=', $ignoreId);
        }

        return $builder->first() !== null;
    }
}
