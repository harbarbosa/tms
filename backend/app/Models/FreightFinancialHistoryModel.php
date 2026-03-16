<?php

namespace App\Models;

class FreightFinancialHistoryModel extends BaseModel
{
    protected $table = 'freight_financial_histories';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'freight_financial_entry_id',
        'evento',
        'status_anterior',
        'status_novo',
        'motivo',
        'payload_json',
        'responsavel',
    ];
}
