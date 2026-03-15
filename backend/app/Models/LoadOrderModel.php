<?php

namespace App\Models;

use CodeIgniter\Model;

class LoadOrderModel extends Model
{
    protected $table = 'load_orders';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'load_id',
        'transport_order_id',
    ];

    protected $useTimestamps = true;

    protected $dateFormat = 'datetime';

    protected $createdField = 'created_at';

    protected $updatedField = 'updated_at';
}
