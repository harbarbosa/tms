<?php

namespace App\Validation;

class TransportDocumentValidation
{
    public static function rules(): array
    {
        return [
            'carga_id' => 'permit_empty|integer',
            'pedido_id' => 'permit_empty|integer',
            'transporter_id' => 'required|integer',
            'driver_id' => 'permit_empty|integer',
            'vehicle_id' => 'permit_empty|integer',
            'data_coleta_prevista' => 'required|valid_date[Y-m-d]',
            'data_entrega_prevista' => 'required|valid_date[Y-m-d]',
            'valor_frete_contratado' => 'permit_empty|decimal',
            'status' => 'required|in_list[rascunho,programada,em_coleta,em_transito,entregue,finalizada,cancelada]',
            'observacoes' => 'permit_empty|max_length[1000]',
        ];
    }
}
