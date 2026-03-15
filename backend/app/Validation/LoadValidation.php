<?php

namespace App\Validation;

class LoadValidation
{
    public static function rules(): array
    {
        return [
            'origem_nome' => 'required|max_length[180]',
            'origem_cidade' => 'required|max_length[120]',
            'origem_estado' => 'required|exact_length[2]',
            'destino_nome' => 'required|max_length[180]',
            'destino_cidade' => 'required|max_length[120]',
            'destino_estado' => 'required|exact_length[2]',
            'data_prevista_saida' => 'required|valid_date[Y-m-d]',
            'data_prevista_entrega' => 'required|valid_date[Y-m-d]',
            'peso_total' => 'permit_empty|decimal',
            'volume_total' => 'permit_empty|decimal',
            'valor_total' => 'permit_empty|decimal',
            'observacoes' => 'permit_empty|max_length[1000]',
            'status' => 'required|in_list[planejada,em_montagem,pronta,em_transporte,entregue,cancelada]',
        ];
    }
}
