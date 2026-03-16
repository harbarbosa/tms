<?php

namespace App\Controllers\Api\V1;

use App\Services\AuthService;
use App\Services\AuthorizationService;

class AuthController extends BaseApiController
{
    public function __construct(
        private readonly AuthService $authService = new AuthService(),
        private readonly AuthorizationService $authorization = new AuthorizationService(),
    )
    {
    }

    public function login()
    {
        $payload = $this->request->getJSON(true) ?? [];
        $rules = [
            'email' => 'required|valid_email',
            'password' => 'required|min_length[6]',
        ];

        if (! $this->validateData($payload, $rules)) {
            return $this->respondValidationError('Dados de autenticacao invalidos.', $this->validator->getErrors());
        }

        try {
            $data = $this->authService->attempt(
                (string) $payload['email'],
                (string) $payload['password'],
            );
        } catch (\RuntimeException $exception) {
            return $this->respondError($exception->getMessage(), null, 401);
        }

        return $this->respondSuccess($data, 'Login realizado com sucesso.');
    }

    public function me()
    {
        $user = $this->authContext->getUser();
        $company = $this->authContext->getCompany();

        $sessionUser = $this->authService->buildUserPayload($user, $company);
        $sessionUser['last_login_at'] = $user['last_login_at'];

        return $this->respondSuccess([
            'user' => $sessionUser,
            'company' => [
                'id' => (int) $company['id'],
                'name' => $company['name'],
                'slug' => $company['slug'],
                'status' => $company['status'],
            ],
            'claims' => $this->authContext->getClaims(),
            'access' => $this->authContext->getAccess(),
        ], 'Usuario autenticado carregado com sucesso.');
    }

    public function permissions()
    {
        return $this->respondSuccess([
            'role' => $this->authContext->getAccess()['role'] ?? null,
            'permissions' => $this->authContext->getPermissions(),
            'scope' => $this->authContext->getScope(),
            'catalog' => $this->authorization->getPermissionCatalog(),
        ], 'Permissoes do usuario carregadas com sucesso.');
    }

    public function logout()
    {
        return $this->respondSuccess(null, 'Logout realizado com sucesso.');
    }
}
