<?php

namespace App\Validation;

class TransportOrderValidation
{
    public static function rules(): array
    {
        return [
            'cliente_nome' => 'required|min_length[3]|max_length[180]',
            'documento_cliente' => 'permit_empty|max_length[30]',
            'cep_entrega' => 'permit_empty|max_length[12]',
            'endereco_entrega' => 'required|max_length[180]',
            'numero_entrega' => 'permit_empty|max_length[20]',
            'bairro_entrega' => 'permit_empty|max_length[120]',
            'cidade_entrega' => 'required|max_length[120]',
            'estado_entrega' => 'required|exact_length[2]',
            'data_prevista_entrega' => 'required|valid_date[Y-m-d]',
            'peso_total' => 'permit_empty|decimal',
            'volume_total' => 'permit_empty|decimal',
            'valor_mercadoria' => 'permit_empty|decimal',
            'observacoes' => 'permit_empty|max_length[1000]',
            'status' => 'required|in_list[pendente,em_planejamento,cotacao,contratado,em_transporte,entregue,cancelado]',
        ];
    }
}
