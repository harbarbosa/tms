<?php

namespace App\Models;

class SystemSettingModel extends BaseModel
{
    protected $table = 'system_settings';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'scope',
        'company_id',
        'category',
        'settings_json',
    ];
}
