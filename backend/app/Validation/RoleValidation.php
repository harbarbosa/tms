<?php

namespace App\Validation;

class RoleValidation
{
    public static function rules(): array
    {
        return [
            'name' => 'required|min_length[3]|max_length[100]',
            'description' => 'permit_empty|max_length[1000]',
            'scope' => 'required|in_list[global,company,carrier,driver]',
            'status' => 'required|in_list[active,inactive]',
        ];
    }
}
