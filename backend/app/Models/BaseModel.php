<?php

namespace App\Models;

use CodeIgniter\Model;

abstract class BaseModel extends Model
{
    protected $useTimestamps = true;

    protected $dateFormat = 'datetime';

    protected $createdField = 'created_at';

    protected $updatedField = 'updated_at';

    protected $useSoftDeletes = true;

    protected $deletedField = 'deleted_at';
}
