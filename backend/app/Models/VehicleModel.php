<?php

namespace App\Models;

class VehicleModel extends BaseModel
{
    protected $table = 'vehicles';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transporter_id',
        'placa',
        'renavam',
        'tipo_veiculo',
        'tipo_carroceria',
        'capacidade_peso',
        'capacidade_volume',
        'ano_modelo',
        'status',
        'observacoes',
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
