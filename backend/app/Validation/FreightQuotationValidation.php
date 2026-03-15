<?php

namespace App\Validation;

class FreightQuotationValidation
{
    public static function rules(): array
    {
        return [
            'tipo_referencia' => 'required|in_list[pedido,carga]',
            'referencia_id' => 'required|integer',
            'data_envio' => 'required|valid_date[Y-m-d]',
            'data_limite_resposta' => 'required|valid_date[Y-m-d]',
            'status' => 'required|in_list[rascunho,enviada,em_analise,aprovada,cancelada,expirada]',
            'observacoes' => 'permit_empty|max_length[1000]',
        ];
    }

    public static function proposalStatuses(): array
    {
        return ['pendente', 'respondida', 'recusada', 'aprovada'];
    }
}
