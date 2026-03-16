<?php

namespace App\Validation;

class SystemCatalogValidation
{
    public static function rules(): array
    {
        return [
            'scope' => 'required|in_list[global,company]',
            'catalog_type' => 'required|max_length[80]',
            'code' => 'required|max_length[120]',
            'label' => 'required|max_length[180]',
            'description' => 'permit_empty|max_length[1000]',
            'sort_order' => 'permit_empty|integer',
            'status' => 'required|in_list[active,inactive]',
        ];
    }
}
