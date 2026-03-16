<?php

namespace App\Models;

class VehicleCheckinModel extends BaseModel
{
    protected $table = 'vehicle_checkins';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transport_document_id',
        'pickup_schedule_id',
        'transporter_id',
        'driver_id',
        'vehicle_id',
        'placa',
        'doca',
        'horario_chegada',
        'horario_entrada',
        'horario_saida',
        'status',
        'observacoes',
        'divergencia',
    ];
}
