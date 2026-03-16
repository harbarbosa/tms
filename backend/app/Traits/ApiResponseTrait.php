<?php

namespace App\Traits;

use CodeIgniter\API\ResponseTrait;

trait ApiResponseTrait
{
    use ResponseTrait;

    protected function buildMeta(): array
    {
        $request = service('request');
        $requestId = method_exists($this, 'getRequestId') ? $this->getRequestId() : bin2hex(random_bytes(8));

        return [
            'request_id' => $requestId,
            'timestamp' => gmdate('c'),
            'path' => '/' . trim($request->getUri()->getPath(), '/'),
        ];
    }

    protected function respondSuccess(mixed $data = null, string $message = 'Operacao realizada com sucesso.', int $status = 200)
    {
        return $this->respond([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null,
            'meta' => $this->buildMeta(),
        ], $status);
    }

    protected function respondError(string $message, mixed $errors = null, int $status = 400)
    {
        $normalizedErrors = $errors;

        if ($normalizedErrors instanceof \Stringable) {
            $normalizedErrors = (string) $normalizedErrors;
        }

        return $this->respond([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $normalizedErrors,
            'meta' => $this->buildMeta(),
        ], $status);
    }
}
