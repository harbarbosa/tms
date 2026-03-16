<?php

namespace App\Validation;

class PickupScheduleValidation
{
    public static function rules(): array
    {
        return [
            'transport_document_id' => 'permit_empty|integer',
            'transporter_id' => 'required|integer',
            'unidade_origem' => 'required|max_length[150]',
            'doca' => 'permit_empty|max_length[80]',
            'data_agendada' => 'required|valid_date[Y-m-d]',
            'hora_inicio' => 'required|regex_match[/^\d{2}:\d{2}$/]',
            'hora_fim' => 'required|regex_match[/^\d{2}:\d{2}$/]',
            'janela_atendimento' => 'permit_empty|max_length[120]',
            'responsavel_agendamento' => 'permit_empty|max_length[150]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'status' => 'required|in_list[agendado,confirmado,em_atendimento,concluido,cancelado,ausente]',
        ];
    }
}
