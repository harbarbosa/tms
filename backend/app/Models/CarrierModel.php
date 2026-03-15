<?php

namespace App\Models;

class CarrierModel extends BaseModel
{
    protected $table = 'carriers';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'razao_social',
        'nome_fantasia',
        'cnpj',
        'antt',
        'email',
        'telefone',
        'cep',
        'endereco',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'estado',
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
