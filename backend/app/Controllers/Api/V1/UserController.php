<?php

namespace App\Controllers\Api\V1;

use App\Models\CompanyModel;
use App\Models\UserCompanyModel;
use App\Models\UserModel;
use App\Services\UserManagementService;
use App\Validation\UserValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class UserController extends BaseApiController
{
    public function __construct(
        private readonly UserModel $users = new UserModel(),
        private readonly CompanyModel $companies = new CompanyModel(),
        private readonly UserCompanyModel $userCompanies = new UserCompanyModel(),
        private readonly UserManagementService $management = new UserManagementService(),
    )
    {
    }

    public function index()
    {
        $this->requirePermission('users.view');
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $companyId = (int) ($this->request->getGet('company_id') ?? 0);
        $roleId = (int) ($this->request->getGet('role_id') ?? 0);

        $builder = $this->users
            ->select('users.id, users.uuid, users.name, users.email, users.telefone, users.status, users.last_login_at, users.created_at, users.updated_at')
            ->select('(SELECT COUNT(*) FROM user_companies WHERE user_companies.user_id = users.id AND user_companies.is_active = 1) as company_count', false)
            ->select('(SELECT companies.id FROM user_companies JOIN companies ON companies.id = user_companies.company_id WHERE user_companies.user_id = users.id AND user_companies.is_default = 1 LIMIT 1) as primary_company_id', false)
            ->select('(SELECT COALESCE(companies.nome_fantasia, companies.razao_social, companies.name) FROM user_companies JOIN companies ON companies.id = user_companies.company_id WHERE user_companies.user_id = users.id AND user_companies.is_default = 1 LIMIT 1) as primary_company_name', false)
            ->select('(SELECT roles.id FROM user_roles JOIN roles ON roles.id = user_roles.role_id WHERE user_roles.user_id = users.id ORDER BY user_roles.id ASC LIMIT 1) as primary_role_id', false)
            ->select('(SELECT roles.name FROM user_roles JOIN roles ON roles.id = user_roles.role_id WHERE user_roles.user_id = users.id ORDER BY user_roles.id ASC LIMIT 1) as primary_role_name', false)
            ->orderBy('users.id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('users.name', $search)
                ->orLike('users.email', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('users.status', $status);
        }

        if ($companyId > 0) {
            $builder->where("EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = users.id AND uc.company_id = {$companyId} AND uc.is_active = 1)", null, false);
        }

        if ($roleId > 0) {
            $builder->where("EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = users.id AND ur.role_id = {$roleId})", null, false);
        }

        $total = $builder->countAllResults(false);
        $items = array_map(fn (array $row): array => $this->management->buildUserDetails($row), $builder->paginate($perPage, 'default', $page));
        $pager = $this->users->pager;

        return $this->respondSuccess([
            'items' => $items,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'pageCount' => $pager->getPageCount(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'company_id' => $companyId > 0 ? $companyId : '',
                'role_id' => $roleId > 0 ? $roleId : '',
            ],
        ], 'Usuarios carregados com sucesso.');
    }

    public function options()
    {
        $this->ensureUserReadAccess();

        $companies = $this->companies
            ->select('id, razao_social, nome_fantasia, name, status')
            ->where('status', 'active')
            ->orderBy('razao_social', 'ASC')
            ->findAll();

        return $this->respondSuccess([
            'companies' => array_map(static function (array $company): array {
                return [
                    'id' => (int) $company['id'],
                    'name' => $company['nome_fantasia'] ?: $company['razao_social'] ?: $company['name'],
                ];
            }, $companies),
            'roles' => array_map(static function (array $role): array {
                return [
                    'id' => (int) $role['id'],
                    'name' => $role['name'],
                    'slug' => $role['slug'],
                ];
            }, $this->management->getRoleOptions()),
        ], 'Opcoes de usuarios carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->ensureUserReadAccess();
        $user = $this->findUserOrFail($id);

        return $this->respondSuccess($this->management->buildUserDetails($user), 'Usuario carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('users.manage');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, UserValidation::rules(true))) {
            return $this->respondError('Nao foi possivel salvar o usuario.', $this->validator->getErrors(), 422);
        }

        $relationshipErrors = $this->validateRelationships($payload);
        if ($relationshipErrors !== []) {
            return $this->respondError('Nao foi possivel salvar o usuario.', $relationshipErrors, 422);
        }

        $data = $this->sanitizePayload($payload, true);

        if ($this->users->existsByEmail($data['email'])) {
            return $this->respondError('Nao foi possivel salvar o usuario.', [
                'email' => 'Ja existe um usuario com este e-mail.',
            ], 422);
        }

        $this->users->insert($data);
        $userId = (int) $this->users->getInsertID();
        $this->management->syncRelationships(
            $userId,
            (int) $payload['primary_company_id'],
            $payload['company_ids'] ?? [],
            (int) $payload['primary_role_id'],
            $payload['role_ids'] ?? []
        );

        return $this->respondSuccess(
            $this->management->buildUserDetails($this->users->find($userId)),
            'Usuario criado com sucesso.',
            201
        );
    }

    public function update(int $id)
    {
        $this->requirePermission('users.manage');
        $this->findUserOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, UserValidation::rules(false))) {
            return $this->respondError('Nao foi possivel atualizar o usuario.', $this->validator->getErrors(), 422);
        }

        $relationshipErrors = $this->validateRelationships($payload);
        if ($relationshipErrors !== []) {
            return $this->respondError('Nao foi possivel atualizar o usuario.', $relationshipErrors, 422);
        }

        $data = $this->sanitizePayload($payload, false);

        if ($this->users->existsByEmail($data['email'], $id)) {
            return $this->respondError('Nao foi possivel atualizar o usuario.', [
                'email' => 'Ja existe um usuario com este e-mail.',
            ], 422);
        }

        $this->users->update($id, $data);
        $this->management->syncRelationships(
            $id,
            (int) $payload['primary_company_id'],
            $payload['company_ids'] ?? [],
            (int) $payload['primary_role_id'],
            $payload['role_ids'] ?? []
        );

        return $this->respondSuccess(
            $this->management->buildUserDetails($this->users->find($id)),
            'Usuario atualizado com sucesso.'
        );
    }

    public function updateStatus(int $id)
    {
        $this->requirePermission('users.manage');
        $this->findUserOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $status = trim((string) ($payload['status'] ?? ''));

        if (! in_array($status, ['active', 'inactive'], true)) {
            return $this->respondError('Nao foi possivel atualizar o status do usuario.', [
                'status' => 'Selecione um status valido.',
            ], 422);
        }

        $this->users->update($id, ['status' => $status]);

        return $this->respondSuccess(
            $this->management->buildUserDetails($this->users->find($id)),
            $status === 'active' ? 'Usuario ativado com sucesso.' : 'Usuario inativado com sucesso.'
        );
    }

    public function resetPassword(int $id)
    {
        $this->requirePermission('users.manage');
        $user = $this->findUserOrFail($id);
        $temporaryPassword = $this->management->resetPassword($id);

        return $this->respondSuccess([
            'user_id' => (int) $user['id'],
            'temporary_password' => $temporaryPassword,
        ], 'Senha redefinida com sucesso.');
    }

    public function profile()
    {
        $this->requirePermission('users.view');

        $userId = (int) ($this->authContext->getUser()['id'] ?? 0);
        $user = $this->users
            ->select('id, uuid, name, email, telefone, carrier_id, driver_id, status, last_login_at, created_at')
            ->find($userId);

        return $this->respondSuccess($user, 'Perfil carregado com sucesso.');
    }

    private function findUserOrFail(int $id): array
    {
        $user = $this->users->find($id);

        if ($user === null) {
            throw PageNotFoundException::forPageNotFound('Usuario nao encontrado.');
        }

        return $user;
    }

    private function sanitizePayload(array $payload, bool $isCreate): array
    {
        $data = [
            'name' => trim((string) ($payload['name'] ?? '')),
            'email' => strtolower(trim((string) ($payload['email'] ?? ''))),
            'telefone' => trim((string) ($payload['telefone'] ?? '')) ?: null,
            'status' => trim((string) ($payload['status'] ?? 'active')) ?: 'active',
        ];

        if ($isCreate) {
            $data['uuid'] = $this->generateUuid();
        }

        $password = trim((string) ($payload['password'] ?? ''));
        if ($password !== '') {
            $data['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }

        return $data;
    }

    private function validateRelationships(array $payload): array
    {
        $errors = [];
        $companyIds = array_values(array_unique(array_map('intval', $payload['company_ids'] ?? [])));
        $roleIds = array_values(array_unique(array_map('intval', $payload['role_ids'] ?? [])));
        $primaryCompanyId = (int) ($payload['primary_company_id'] ?? 0);
        $primaryRoleId = (int) ($payload['primary_role_id'] ?? 0);
        $validRoleIds = array_map(static fn (array $role): int => (int) $role['id'], $this->management->getRoleOptions());

        if ($companyIds === []) {
            $errors['company_ids'] = 'Selecione ao menos uma empresa vinculada.';
        }

        if (! in_array($primaryCompanyId, $companyIds, true)) {
            $errors['primary_company_id'] = 'A empresa principal deve estar entre as empresas vinculadas.';
        }

        if ($roleIds === []) {
            $errors['role_ids'] = 'Selecione ao menos um perfil vinculado.';
        }

        if (! in_array($primaryRoleId, $roleIds, true)) {
            $errors['primary_role_id'] = 'O perfil principal deve estar entre os perfis vinculados.';
        }

        foreach ($companyIds as $companyId) {
            if ($this->companies->find($companyId) === null) {
                $errors['company_ids'] = 'Uma das empresas selecionadas nao foi encontrada.';
                break;
            }
        }

        foreach ($roleIds as $roleId) {
            if (! in_array($roleId, $validRoleIds, true)) {
                $errors['role_ids'] = 'Um dos perfis selecionados nao foi encontrado.';
                break;
            }
        }

        return $errors;
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    private function ensureUserReadAccess(): void
    {
        if (! $this->hasPermission('users.view') && ! $this->hasPermission('users.manage')) {
            $this->requirePermission('users.view');
        }
    }
}
