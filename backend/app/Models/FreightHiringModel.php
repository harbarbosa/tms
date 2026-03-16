<?php

namespace App\Models;

class FreightHiringModel extends BaseModel
{
    protected $table = 'freight_hirings';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'freight_quotation_id',
        'freight_quotation_proposal_id',
        'transport_document_id',
        'tipo_referencia',
        'referencia_id',
        'transporter_id',
        'valor_contratado',
        'prazo_entrega_dias',
        'condicoes_comerciais',
        'observacoes',
        'status',
        'contratado_por',
        'data_contratacao',
    ];
}
