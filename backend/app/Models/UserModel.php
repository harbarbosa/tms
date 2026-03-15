<?php

namespace App\Models;

class UserModel extends BaseModel
{
    protected $table = 'users';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'uuid',
        'name',
        'email',
        'password_hash',
        'carrier_id',
        'driver_id',
        'status',
        'last_login_at',
    ];

    public function findActiveByEmail(string $email): ?array
    {
        return $this->where('email', $email)
            ->where('status', 'active')
            ->first();
    }
}
