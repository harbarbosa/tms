<?php

namespace App\Validation;

class VehicleValidation
{
    public static function rules(): array
    {
        return [
            'transporter_id' => 'required|integer',
            'placa' => 'required|max_length[10]|validVehiclePlate',
            'renavam' => 'permit_empty|max_length[20]',
            'tipo_veiculo' => 'required|max_length[80]',
            'tipo_carroceria' => 'permit_empty|max_length[80]',
            'capacidade_peso' => 'permit_empty|decimal',
            'capacidade_volume' => 'permit_empty|decimal',
            'ano_modelo' => 'permit_empty|integer|greater_than_equal_to[1950]|less_than_equal_to[2100]',
            'status' => 'required|in_list[active,inactive]',
            'observacoes' => 'permit_empty|max_length[1000]',
        ];
    }
}
