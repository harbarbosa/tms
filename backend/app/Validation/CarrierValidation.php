<?php

namespace App\Validation;

class CarrierValidation
{
    public static function rules(?int $carrierId = null): array
    {
        return [
            'razao_social' => 'required|min_length[3]|max_length[180]',
            'nome_fantasia' => 'permit_empty|max_length[180]',
            'cnpj' => 'permit_empty|max_length[18]|validCnpj',
            'antt' => 'permit_empty|max_length[30]',
            'email' => 'permit_empty|valid_email|max_length[180]',
            'telefone' => 'permit_empty|max_length[30]',
            'cep' => 'permit_empty|max_length[12]',
            'endereco' => 'permit_empty|max_length[180]',
            'numero' => 'permit_empty|max_length[20]',
            'complemento' => 'permit_empty|max_length[120]',
            'bairro' => 'permit_empty|max_length[120]',
            'cidade' => 'permit_empty|max_length[120]',
            'estado' => 'permit_empty|exact_length[2]',
            'status' => 'required|in_list[active,inactive]',
        ];
    }
}
