<?php

namespace App\Models;

class FreightFinancialEntryModel extends BaseModel
{
    protected $table = 'freight_financial_entries';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transport_document_id',
        'freight_audit_id',
        'transporter_id',
        'valor_previsto',
        'valor_aprovado',
        'valor_pago',
        'data_prevista_pagamento',
        'data_pagamento',
        'forma_pagamento',
        'status',
        'motivo_bloqueio',
        'observacoes',
        'criado_por',
        'atualizado_por',
    ];
}
