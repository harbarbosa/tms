<?php

namespace App\Filters;

use App\Models\UserCompanyModel;
use App\Models\UserModel;
use App\Services\AuthorizationService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

class AuthFilter implements FilterInterface
{
    private function buildErrorResponse(int $status, string $message, mixed $errors = null): ResponseInterface
    {
        $request = service('request');
        $requestId = $request->getHeaderLine('X-Request-Id') ?: bin2hex(random_bytes(8));

        return Services::response()
            ->setHeader('X-Request-Id', $requestId)
            ->setStatusCode($status)
            ->setJSON([
                'success' => false,
                'message' => $message,
                'data' => null,
                'errors' => $errors,
                'meta' => [
                    'request_id' => $requestId,
                    'timestamp' => gmdate('c'),
                    'path' => '/' . trim($request->getUri()->getPath(), '/'),
                ],
            ]);
    }

    public function before(RequestInterface $request, $arguments = null)
    {
        $authorizationHeader = $request->getHeaderLine('Authorization');

        if (! preg_match('/Bearer\s+(.*)$/i', $authorizationHeader, $matches)) {
            log_message('notice', 'Auth denied: missing bearer token | path={path}', [
                'path' => '/' . trim($request->getUri()->getPath(), '/'),
            ]);

            return $this->buildErrorResponse(401, 'Token de acesso nao informado.');
        }

        try {
            $claims = service('jwt')->parse(trim($matches[1]));
        } catch (\Throwable $exception) {
            log_message('warning', 'Auth denied: invalid token | path={path} | message={message}', [
                'path' => '/' . trim($request->getUri()->getPath(), '/'),
                'message' => $exception->getMessage(),
            ]);

            return $this->buildErrorResponse(401, 'Token de acesso invalido.', ['token' => $exception->getMessage()]);
        }

        $userModel = new UserModel();
        $user = $userModel->find((int) ($claims['sub'] ?? 0));

        if ($user === null || $user['status'] !== 'active') {
            log_message('warning', 'Auth denied: user unavailable | user_id={userId}', [
                'userId' => (int) ($claims['sub'] ?? 0),
            ]);

            return $this->buildErrorResponse(401, 'Usuario autenticado nao esta disponivel.');
        }

        $requestedCompanyId = (int) $request->getHeaderLine('X-Company-Id');
        $companyId = $requestedCompanyId > 0 ? $requestedCompanyId : (int) ($claims['company_id'] ?? 0);

        $userCompanyModel = new UserCompanyModel();
        $company = $userCompanyModel->findCompanyForUser((int) $user['id'], $companyId);

        if ($company === null) {
            log_message('warning', 'Auth denied: company access denied | user_id={userId} | company_id={companyId}', [
                'userId' => (int) $user['id'],
                'companyId' => $companyId,
            ]);

            return $this->buildErrorResponse(403, 'Usuario sem acesso a empresa informada.');
        }

        $authorization = new AuthorizationService();
        service('authContext')->setClaims($claims);
        service('authContext')->setUser($user);
        service('authContext')->setCompany($company);
        service('authContext')->setAccess($authorization->buildAccessProfile($user, $company));

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
