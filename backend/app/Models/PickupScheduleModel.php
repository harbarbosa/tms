<?php

namespace App\Models;

class PickupScheduleModel extends BaseModel
{
    protected $table = 'pickup_schedules';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'company_id',
        'transport_document_id',
        'transporter_id',
        'unidade_origem',
        'doca',
        'data_agendada',
        'hora_inicio',
        'hora_fim',
        'janela_atendimento',
        'responsavel_agendamento',
        'observacoes',
        'status',
    ];
}
