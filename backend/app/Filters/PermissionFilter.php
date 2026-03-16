<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

class PermissionFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $requiredPermission = $arguments[0] ?? null;
        $permissions = service('authContext')->getPermissions();

        if (! $requiredPermission || in_array($requiredPermission, $permissions, true)) {
            return null;
        }

        $requestId = $request->getHeaderLine('X-Request-Id') ?: bin2hex(random_bytes(8));

        log_message('notice', 'Permission denied | permission={permission} | path={path}', [
            'permission' => $requiredPermission,
            'path' => '/' . trim($request->getUri()->getPath(), '/'),
        ]);

        return Services::response()
            ->setHeader('X-Request-Id', $requestId)
            ->setStatusCode(403)
            ->setJSON([
                'success' => false,
                'message' => 'Voce nao possui permissao para acessar este recurso.',
                'data' => null,
                'errors' => [
                    'permission' => sprintf('Permissao requerida: %s', $requiredPermission),
                ],
                'meta' => [
                    'request_id' => $requestId,
                    'timestamp' => gmdate('c'),
                    'path' => '/' . trim($request->getUri()->getPath(), '/'),
                ],
            ]);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
