<?php

namespace App\Traits;

use CodeIgniter\API\ResponseTrait;

trait ApiResponseTrait
{
    use ResponseTrait;

    protected function respondSuccess(mixed $data = null, string $message = 'Operacao realizada com sucesso.', int $status = 200)
    {
        return $this->respond([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null,
        ], $status);
    }

    protected function respondError(string $message, mixed $errors = null, int $status = 400)
    {
        return $this->respond([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors,
        ], $status);
    }
}
