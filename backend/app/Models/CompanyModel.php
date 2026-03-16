<?php

namespace App\Models;

class CompanyModel extends BaseModel
{
    protected $table = 'companies';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'uuid',
        'name',
        'slug',
        'legal_name',
        'tax_id',
        'razao_social',
        'nome_fantasia',
        'cnpj',
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
        'tipo_empresa',
        'limite_usuarios',
        'limite_transportadoras',
        'limite_veiculos',
        'limite_motoristas',
        'settings',
    ];

    public function existsByField(string $field, string $value, ?int $ignoreId = null): bool
    {
        $builder = $this->builder()
            ->where($field, $value)
            ->where('deleted_at', null);

        if ($ignoreId !== null) {
            $builder->where('id !=', $ignoreId);
        }

        return (bool) $builder->countAllResults();
    }
}
