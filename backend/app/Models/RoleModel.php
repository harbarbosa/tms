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
        'scope',
        'status',
        'is_system',
    ];

    public function existsBySlug(string $slug, ?int $ignoreId = null): bool
    {
        $builder = $this->builder()
            ->where('slug', $slug)
            ->where('deleted_at', null);

        if ($ignoreId !== null) {
            $builder->where('id !=', $ignoreId);
        }

        return (bool) $builder->countAllResults();
    }
}
