<?php

namespace App\Models;

class TransportDocumentModel extends BaseModel
{
    protected $table = 'transport_documents';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'numero_ot',
        'carga_id',
        'pedido_id',
        'transporter_id',
        'driver_id',
        'vehicle_id',
        'data_coleta_prevista',
        'data_entrega_prevista',
        'valor_frete_contratado',
        'status',
        'observacoes',
    ];
}
