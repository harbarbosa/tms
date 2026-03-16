<?php

namespace App\Validation;

class SettingsValidation
{
    public static function globalRules(): array
    {
        return [
            'system_name' => 'required|max_length[120]',
            'logo_url' => 'permit_empty|max_length[255]',
            'contact_email' => 'required|valid_email|max_length[180]',
            'timezone' => 'required|max_length[80]',
            'date_format' => 'required|max_length[20]',
            'time_format' => 'required|max_length[20]',
            'max_file_size_mb' => 'required|integer|greater_than_equal_to[1]',
            'allowed_extensions' => 'required|max_length[255]',
        ];
    }

    public static function companyRules(): array
    {
        return [
            'transport_order_default_status' => 'required|max_length[50]',
            'load_default_status' => 'required|max_length[50]',
            'pickup_schedule_default_status' => 'required|max_length[50]',
            'vehicle_checkin_default_status' => 'required|max_length[50]',
            'delivery_tolerance_hours' => 'required|integer|greater_than_equal_to[0]',
            'pickup_window_minutes' => 'required|integer|greater_than_equal_to[0]',
            'auto_block_divergent_financial' => 'required|in_list[0,1]',
            'company_upload_max_file_size_mb' => 'required|integer|greater_than_equal_to[1]',
            'company_allowed_extensions' => 'required|max_length[255]',
            'limite_usuarios' => 'required|integer|greater_than_equal_to[1]',
            'limite_transportadoras' => 'required|integer|greater_than_equal_to[1]',
            'limite_veiculos' => 'required|integer|greater_than_equal_to[1]',
            'limite_motoristas' => 'required|integer|greater_than_equal_to[1]',
        ];
    }
}
