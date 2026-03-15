<?php

namespace App\Models;

class DeliveryReceiptModel extends BaseModel
{
    protected $table = 'delivery_receipts';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'ordem_transporte_id',
        'data_entrega_real',
        'nome_recebedor',
        'documento_recebedor',
        'observacoes_entrega',
        'arquivo_comprovante',
        'nome_arquivo_original',
        'mime_type',
        'tamanho_arquivo',
    ];
}
