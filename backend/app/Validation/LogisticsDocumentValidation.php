<?php

namespace App\Validation;

class LogisticsDocumentValidation
{
    public static function tripDocumentRules(): array
    {
        return [
            'ordem_transporte_id' => 'required|integer',
            'tipo_documento' => 'required|in_list[CTe,MDFe,Nota Fiscal,Comprovante de Entrega,Outros]',
            'numero_documento' => 'permit_empty|max_length[120]',
            'observacoes' => 'permit_empty|max_length[1000]',
        ];
    }

    public static function deliveryReceiptRules(): array
    {
        return [
            'ordem_transporte_id' => 'required|integer',
            'data_entrega_real' => 'required|valid_date[Y-m-d H:i:s]',
            'nome_recebedor' => 'required|max_length[180]',
            'documento_recebedor' => 'permit_empty|max_length[60]',
            'observacoes_entrega' => 'permit_empty|max_length[1000]',
        ];
    }
}
