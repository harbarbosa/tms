<?php

namespace App\Models;

class TransportOrderModel extends BaseModel
{
    protected $table = 'transport_orders';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'numero_pedido',
        'cliente_nome',
        'documento_cliente',
        'cep_entrega',
        'endereco_entrega',
        'numero_entrega',
        'bairro_entrega',
        'cidade_entrega',
        'estado_entrega',
        'data_prevista_entrega',
        'peso_total',
        'volume_total',
        'valor_mercadoria',
        'observacoes',
        'status',
    ];
}
