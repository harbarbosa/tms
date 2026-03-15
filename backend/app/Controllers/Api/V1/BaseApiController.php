<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Libraries\AuthContext;
use App\Traits\ApiResponseTrait;
use CodeIgniter\Exceptions\PageForbiddenException;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

abstract class BaseApiController extends BaseController
{
    use ApiResponseTrait;

    protected AuthContext $authContext;

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);

        $this->authContext = service('authContext');
    }

    protected function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->authContext->getPermissions(), true);
    }

    protected function requirePermission(string $permission): void
    {
        if (! $this->hasPermission($permission)) {
            throw PageForbiddenException::forPageForbidden('Voce nao possui permissao para acessar este recurso.');
        }
    }

    protected function getCurrentRole(): ?string
    {
        return $this->authContext->getRole();
    }

    protected function getCurrentScope(): array
    {
        return $this->authContext->getScope();
    }
}
