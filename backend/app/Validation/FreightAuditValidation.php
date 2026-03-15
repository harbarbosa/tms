<?php

namespace App\Validation;

class FreightAuditValidation
{
    public static function rules(): array
    {
        return [
            'ordem_transporte_id' => 'required|integer',
            'valor_contratado' => 'required|decimal',
            'valor_cte' => 'permit_empty|decimal',
            'valor_cobrado' => 'required|decimal',
            'status_auditoria' => 'required|in_list[pendente,aprovado,divergente,recusado]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'data_auditoria' => 'required|valid_date[Y-m-d H:i:s]',
        ];
    }
}
