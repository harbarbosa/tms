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

        return Services::response()
            ->setStatusCode(403)
            ->setJSON([
                'success' => false,
                'message' => 'Voce nao possui permissao para acessar este recurso.',
                'data' => null,
                'errors' => [
                    'permission' => sprintf('Permissao requerida: %s', $requiredPermission),
                ],
            ]);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
