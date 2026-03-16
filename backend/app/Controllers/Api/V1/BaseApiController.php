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
    private string $requestId;

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);

        $this->authContext = service('authContext');
        $this->requestId = $request->getHeaderLine('X-Request-Id') ?: bin2hex(random_bytes(8));
        $this->response->setHeader('X-Request-Id', $this->requestId);
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

    protected function getRequestId(): string
    {
        return $this->requestId;
    }

    protected function getPaginationParams(int $defaultPerPage = 10, int $maxPerPage = 50): array
    {
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min($maxPerPage, max(5, (int) ($this->request->getGet('perPage') ?? $defaultPerPage)));

        return [$page, $perPage];
    }

    protected function respondPaginated(
        array $items,
        int $page,
        int $perPage,
        int $total,
        int $pageCount,
        array $filters = [],
        array $extra = [],
        string $message = 'Registros carregados com sucesso.'
    ) {
        return $this->respondSuccess([
            'items' => $items,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'pageCount' => $pageCount,
            ],
            'filters' => $filters,
            ...$extra,
        ], $message);
    }

    protected function respondValidationError(string $message, array $errors)
    {
        return $this->respondError($message, $errors, 422);
    }

    protected function getJsonPayload(): array
    {
        return $this->request->getJSON(true) ?? [];
    }
}
