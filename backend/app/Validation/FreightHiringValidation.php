<?php

namespace App\Validation;

class FreightHiringValidation
{
    public static function rules(): array
    {
        return [
            'freight_quotation_id' => 'required|integer',
            'freight_quotation_proposal_id' => 'required|integer',
            'tipo_referencia' => 'required|in_list[pedido,carga]',
            'referencia_id' => 'required|integer',
            'transporter_id' => 'required|integer',
            'valor_contratado' => 'permit_empty|decimal',
            'prazo_entrega_dias' => 'permit_empty|integer',
            'condicoes_comerciais' => 'permit_empty|max_length[2000]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'status' => 'required|in_list[pendente,contratado,cancelado,convertido_em_ot]',
            'data_contratacao' => 'required|valid_date[Y-m-d H:i:s]',
        ];
    }
}
