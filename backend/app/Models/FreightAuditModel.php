<?php

namespace App\Models;

class FreightAuditModel extends BaseModel
{
    protected $table = 'freight_audits';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'ordem_transporte_id',
        'valor_contratado',
        'valor_cte',
        'valor_cobrado',
        'diferenca_valor',
        'status_auditoria',
        'observacoes',
        'auditado_por',
        'data_auditoria',
    ];
}
