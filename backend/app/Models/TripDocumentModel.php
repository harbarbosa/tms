<?php

namespace App\Models;

class TripDocumentModel extends BaseModel
{
    protected $table = 'trip_documents';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'ordem_transporte_id',
        'tipo_documento',
        'numero_documento',
        'arquivo',
        'nome_arquivo_original',
        'mime_type',
        'tamanho_arquivo',
        'observacoes',
        'enviado_por',
    ];
}
