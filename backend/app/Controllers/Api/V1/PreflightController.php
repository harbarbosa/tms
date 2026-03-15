<?php

namespace App\Controllers\Api\V1;

class PreflightController extends BaseApiController
{
    public function handle()
    {
        return $this->response->setStatusCode(204);
    }
}
