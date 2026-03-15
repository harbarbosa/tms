<?php

namespace App\Models;

class IncidentModel extends BaseModel
{
    protected $table = 'incidents';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transport_document_id',
        'tipo_ocorrencia',
        'status',
        'occurred_at',
        'observacoes',
        'attachment_path',
    ];
}
