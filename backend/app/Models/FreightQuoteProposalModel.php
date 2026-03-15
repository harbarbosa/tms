<?php

namespace App\Models;

use CodeIgniter\Model;

class FreightQuoteProposalModel extends Model
{
    protected $table = 'freight_quote_proposals';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'cotacao_id',
        'transporter_id',
        'valor_frete',
        'prazo_entrega_dias',
        'observacoes',
        'status_resposta',
    ];

    protected $useTimestamps = true;

    protected $dateFormat = 'datetime';

    protected $createdField = 'created_at';

    protected $updatedField = 'updated_at';
}
