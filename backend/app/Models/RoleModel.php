<?php

namespace App\Models;

class RoleModel extends BaseModel
{
    protected $table = 'roles';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'name',
        'slug',
        'description',
        'is_system',
    ];
}
