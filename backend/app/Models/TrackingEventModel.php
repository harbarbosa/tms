<?php

namespace App\Models;

class TrackingEventModel extends BaseModel
{
    protected $table = 'tracking_events';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transport_document_id',
        'status',
        'event_at',
        'observacoes',
        'attachment_path',
    ];
}
