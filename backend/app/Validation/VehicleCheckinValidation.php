<?php

namespace App\Validation;

class VehicleCheckinValidation
{
    public static function rules(): array
    {
        return [
            'transport_document_id' => 'permit_empty|integer',
            'pickup_schedule_id' => 'permit_empty|integer',
            'transporter_id' => 'required|integer',
            'driver_id' => 'permit_empty|integer',
            'vehicle_id' => 'permit_empty|integer',
            'placa' => 'permit_empty|max_length[10]',
            'doca' => 'permit_empty|max_length[80]',
            'horario_chegada' => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'horario_entrada' => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'horario_saida' => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'status' => 'required|in_list[aguardando,chegou,em_doca,carregando,finalizado,recusado]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'divergencia' => 'permit_empty|in_list[0,1,true,false]',
        ];
    }
}
