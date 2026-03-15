<?php

namespace App\Models;

class LoadModel extends BaseModel
{
    protected $table = 'loads';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'codigo_carga',
        'origem_nome',
        'origem_cidade',
        'origem_estado',
        'destino_nome',
        'destino_cidade',
        'destino_estado',
        'data_prevista_saida',
        'data_prevista_entrega',
        'peso_total',
        'volume_total',
        'valor_total',
        'observacoes',
        'status',
    ];
}
