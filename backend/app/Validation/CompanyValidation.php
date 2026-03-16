<?php

namespace App\Validation;

class CompanyValidation
{
    public static function rules(): array
    {
        return [
            'razao_social' => 'required|min_length[3]|max_length[180]',
            'nome_fantasia' => 'permit_empty|max_length[180]',
            'cnpj' => 'permit_empty|max_length[18]|validCnpj',
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
            'tipo_empresa' => 'required|in_list[embarcador,transportadora,operador_logistico,hibrida]',
            'limite_usuarios' => 'required|integer|greater_than_equal_to[1]',
            'limite_transportadoras' => 'required|integer|greater_than_equal_to[0]',
            'limite_veiculos' => 'required|integer|greater_than_equal_to[0]',
            'limite_motoristas' => 'required|integer|greater_than_equal_to[0]',
        ];
    }
}
