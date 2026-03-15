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
    public function before(RequestInterface $request, $arguments = null)
    {
        $authorizationHeader = $request->getHeaderLine('Authorization');

        if (! preg_match('/Bearer\s+(.*)$/i', $authorizationHeader, $matches)) {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Token de acesso nao informado.',
                    'data' => null,
                    'errors' => null,
                ]);
        }

        try {
            $claims = service('jwt')->parse(trim($matches[1]));
        } catch (\Throwable $exception) {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Token de acesso invalido.',
                    'data' => null,
                    'errors' => ['token' => $exception->getMessage()],
                ]);
        }

        $userModel = new UserModel();
        $user = $userModel->find((int) ($claims['sub'] ?? 0));

        if ($user === null || $user['status'] !== 'active') {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Usuario autenticado nao esta disponivel.',
                    'data' => null,
                    'errors' => null,
                ]);
        }

        $requestedCompanyId = (int) $request->getHeaderLine('X-Company-Id');
        $companyId = $requestedCompanyId > 0 ? $requestedCompanyId : (int) ($claims['company_id'] ?? 0);

        $userCompanyModel = new UserCompanyModel();
        $company = $userCompanyModel->findCompanyForUser((int) $user['id'], $companyId);

        if ($company === null) {
            return Services::response()
                ->setStatusCode(403)
                ->setJSON([
                    'success' => false,
                    'message' => 'Usuario sem acesso a empresa informada.',
                    'data' => null,
                    'errors' => null,
                ]);
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
