<?php

namespace App\Models;

class CompanyModel extends BaseModel
{
    protected $table = 'companies';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'uuid',
        'name',
        'slug',
        'legal_name',
        'tax_id',
        'status',
        'settings',
    ];
}
