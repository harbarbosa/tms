<?php

namespace App\Controllers\Api\V1;

use App\Models\CompanyModel;

class CompanyController extends BaseApiController
{
    public function __construct(private readonly CompanyModel $companies = new CompanyModel())
    {
    }

    public function index()
    {
        $this->requirePermission('companies.view');

        $data = $this->companies
            ->select('id, uuid, name, slug, tax_id, status, created_at')
            ->findAll();

        return $this->respondSuccess($data, 'Empresas carregadas com sucesso.');
    }
}
