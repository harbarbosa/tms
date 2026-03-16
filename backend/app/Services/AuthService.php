<?php

namespace App\Services;

use App\Libraries\JwtService;
use App\Models\CompanyModel;
use App\Models\UserCompanyModel;
use App\Models\UserModel;
use Config\TmsAuth;
use RuntimeException;

class AuthService
{
    private UserModel $users;

    private UserCompanyModel $userCompanies;

    private CompanyModel $companies;

    private JwtService $jwtService;

    private AuthorizationService $authorization;

    public function __construct()
    {
        $this->users = new UserModel();
        $this->userCompanies = new UserCompanyModel();
        $this->companies = new CompanyModel();
        $this->jwtService = new JwtService(config(TmsAuth::class));
        $this->authorization = new AuthorizationService();
    }

    public function attempt(string $email, string $password): array
    {
        $user = $this->users->findActiveByEmail($email);

        if ($user === null || ! password_verify($password, $user['password_hash'])) {
            log_message('notice', 'Login failed for {email}', ['email' => $email]);
            throw new RuntimeException('Credenciais invalidas.');
        }

        $company = $this->userCompanies->findDefaultCompanyForUser((int) $user['id']);

        if ($company === null) {
            log_message('warning', 'Login blocked: user without company | user_id={userId}', ['userId' => (int) $user['id']]);
            throw new RuntimeException('Usuario sem empresa vinculada.');
        }

        $token = $this->jwtService->generateAccessToken([
            'sub' => (int) $user['id'],
            'company_id' => (int) $company['id'],
            'email' => $user['email'],
        ]);

        $this->users->update($user['id'], [
            'last_login_at' => date('Y-m-d H:i:s'),
        ]);

        log_message('info', 'Login succeeded | user_id={userId} | company_id={companyId}', [
            'userId' => (int) $user['id'],
            'companyId' => (int) $company['id'],
        ]);

        return [
            'token' => $token,
            'user' => $this->buildUserPayload($user, $company),
        ];
    }

    public function buildUserPayload(array $user, array $company): array
    {
        $access = $this->authorization->buildAccessProfile($user, $company);

        return [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'status' => $user['status'],
            'role' => $access['role']['slug'] ?? null,
            'role_name' => $access['role']['name'] ?? null,
            'permissions' => $access['permissions'],
            'scope' => $access['scope'],
            'companyName' => $company['name'],
            'company' => [
                'id' => (int) $company['id'],
                'name' => $company['name'],
                'slug' => $company['slug'],
            ],
        ];
    }
}
