<?php

namespace App\Validation;

class UserValidation
{
    public static function rules(bool $requirePassword = true): array
    {
        return [
            'name' => 'required|min_length[3]|max_length[150]',
            'email' => 'required|valid_email|max_length[180]',
            'telefone' => 'permit_empty|max_length[30]',
            'password' => $requirePassword
                ? 'required|min_length[6]|max_length[50]'
                : 'permit_empty|min_length[6]|max_length[50]',
            'status' => 'required|in_list[active,inactive]',
            'primary_company_id' => 'required|integer|greater_than[0]',
            'company_ids' => 'required',
            'primary_role_id' => 'required|integer|greater_than[0]',
            'role_ids' => 'required',
        ];
    }
}
