<?php

namespace App\Models;

class SystemCatalogItemModel extends BaseModel
{
    protected $table = 'system_catalog_items';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    protected $allowedFields = [
        'scope',
        'company_id',
        'catalog_type',
        'code',
        'label',
        'description',
        'sort_order',
        'status',
        'metadata_json',
    ];
}
