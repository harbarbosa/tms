<?php

namespace App\Libraries;

use CodeIgniter\Debug\BaseExceptionHandler;
use CodeIgniter\Debug\ExceptionHandlerInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Throwable;

class ApiExceptionHandler extends BaseExceptionHandler implements ExceptionHandlerInterface
{
    public function handle(
        Throwable $exception,
        RequestInterface $request,
        ResponseInterface $response,
        int $statusCode,
        int $exitCode,
    ): void {
        $response
            ->setStatusCode($statusCode)
            ->setContentType('application/json')
            ->setJSON([
                'success' => false,
                'message' => $this->isDisplayErrorsEnabled()
                    ? $exception->getMessage()
                    : 'Ocorreu um erro inesperado ao processar a requisicao.',
                'errors' => $this->isDisplayErrorsEnabled() ? [
                    'type' => $exception::class,
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                ] : null,
                'data' => null,
            ])
            ->send();

        if (ENVIRONMENT !== 'testing') {
            exit($exitCode);
        }
    }

    private function isDisplayErrorsEnabled(): bool
    {
        return in_array(strtolower((string) ini_get('display_errors')), ['1', 'true', 'on', 'yes'], true);
    }
}
