<?php

namespace App\Validation;

class TrackingValidation
{
    public static function eventRules(): array
    {
        return [
            'status' => 'required|in_list[aguardando_coleta,coletado,em_transito,em_entrega,entregue,com_ocorrencia,cancelado]',
            'event_at' => 'required|valid_date[Y-m-d H:i:s]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'attachment_path' => 'permit_empty|max_length[255]',
        ];
    }

    public static function incidentRules(): array
    {
        return [
            'transport_document_id' => 'required|integer',
            'tipo_ocorrencia' => 'required|in_list[atraso,avaria,recusa,devolucao,extravio,problema_operacional]',
            'status' => 'required|in_list[aberta,em_tratativa,resolvida,cancelada]',
            'occurred_at' => 'required|valid_date[Y-m-d H:i:s]',
            'observacoes' => 'permit_empty|max_length[1000]',
            'attachment_path' => 'permit_empty|max_length[255]',
        ];
    }
}
