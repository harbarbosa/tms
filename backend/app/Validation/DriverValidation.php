<?php

namespace App\Validation;

class DriverValidation
{
    public static function rules(): array
    {
        return [
            'transporter_id' => 'required|integer',
            'nome' => 'required|min_length[3]|max_length[180]',
            'cpf' => 'required|max_length[14]|validCpf',
            'cnh' => 'required|max_length[30]',
            'categoria_cnh' => 'required|max_length[10]',
            'validade_cnh' => 'required|valid_date[Y-m-d]',
            'telefone' => 'permit_empty|max_length[30]',
            'email' => 'permit_empty|valid_email|max_length[180]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'status' => 'required|in_list[active,inactive]',
        ];
    }
}
