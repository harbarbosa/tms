<?php

namespace App\Validation;

class FinancialValidation
{
    public static function rules(): array
    {
        return [
            'transport_document_id' => 'required|integer',
            'freight_audit_id' => 'required|integer',
            'transporter_id' => 'required|integer',
            'valor_previsto' => 'required|decimal',
            'valor_aprovado' => 'permit_empty|decimal',
            'valor_pago' => 'permit_empty|decimal',
            'data_prevista_pagamento' => 'permit_empty|valid_date[Y-m-d]',
            'data_pagamento' => 'permit_empty|valid_date[Y-m-d]',
            'forma_pagamento' => 'permit_empty|max_length[50]',
            'status' => 'required|in_list[pendente,em_analise,liberado,bloqueado,pago,cancelado]',
            'motivo_bloqueio' => 'permit_empty|max_length[1000]',
            'observacoes' => 'permit_empty|max_length[1000]',
        ];
    }
}
