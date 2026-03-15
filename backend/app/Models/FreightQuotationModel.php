<?php

namespace App\Models;

class FreightQuotationModel extends BaseModel
{
    protected $table = 'freight_quotations';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'tipo_referencia',
        'referencia_id',
        'data_envio',
        'data_limite_resposta',
        'status',
        'observacoes',
    ];
}
