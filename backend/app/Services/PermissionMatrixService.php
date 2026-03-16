<?php

namespace App\Services;

use App\Models\PermissionModel;
use App\Models\RoleModel;
use App\Models\RolePermissionModel;
use CodeIgniter\Exceptions\PageNotFoundException;

class PermissionMatrixService
{
    private const MODULE_LABELS = [
        'dashboard' => 'Dashboard',
        'companies' => 'Empresas',
        'users' => 'Usuarios',
        'roles' => 'Perfis',
        'permissions' => 'Permissoes',
        'carriers' => 'Transportadoras',
        'drivers' => 'Motoristas',
        'vehicles' => 'Veiculos',
        'transport_orders' => 'Pedidos',
        'loads' => 'Cargas',
        'freight_quotations' => 'Cotacoes',
        'freight_hirings' => 'Contratacoes',
        'transport_documents' => 'Ordens de transporte',
        'pickup_schedules' => 'Agendamentos de coleta',
        'vehicle_checkins' => 'Check-ins de veiculo',
        'delivery_tracking' => 'Rastreamento',
        'incidents' => 'Ocorrencias',
        'trip_documents' => 'Documentos',
        'proof_of_deliveries' => 'Comprovantes',
        'freight_audits' => 'Auditoria',
        'financial' => 'Financeiro',
        'reports' => 'Relatorios',
        'settings' => 'Configuracoes',
    ];

    private const ACTION_LABELS = [
        'view' => 'Visualizar',
        'create' => 'Criar',
        'update' => 'Editar',
        'delete' => 'Excluir',
        'approve' => 'Aprovar',
        'audit' => 'Auditar',
        'export' => 'Exportar',
        'manage' => 'Gerenciar',
        'respond' => 'Responder',
    ];

    private const ACTION_ORDER = ['view', 'create', 'update', 'delete', 'approve', 'audit', 'export', 'manage', 'respond'];

    private PermissionModel $permissions;

    private RoleModel $roles;

    private RolePermissionModel $rolePermissions;

    public function __construct()
    {
        $this->permissions = new PermissionModel();
        $this->roles = new RoleModel();
        $this->rolePermissions = new RolePermissionModel();
    }

    public function buildMatrix(?int $roleId = null, string $moduleFilter = ''): array
    {
        $roles = $this->roles
            ->select('id, name, slug, scope, status, is_system')
            ->where('deleted_at', null)
            ->orderBy('name', 'ASC')
            ->findAll();

        $selectedRoleId = $roleId ?: (isset($roles[0]['id']) ? (int) $roles[0]['id'] : null);
        $selectedRole = $selectedRoleId ? $this->roles->find($selectedRoleId) : null;

        if ($selectedRoleId !== null && $selectedRole === null) {
            throw PageNotFoundException::forPageNotFound('Perfil nao encontrado.');
        }

        $catalog = $this->permissions
            ->select('id, name, slug, module, description')
            ->where('deleted_at', null)
            ->orderBy('module', 'ASC')
            ->orderBy('name', 'ASC')
            ->findAll();

        $assignedIds = $selectedRoleId ? $this->findPermissionIdsForRole($selectedRoleId) : [];

        $modules = [];

        foreach ($catalog as $permission) {
            $module = $permission['module'];
            if ($moduleFilter !== '' && $module !== $moduleFilter) {
                continue;
            }

            $action = $this->resolveActionFromSlug($permission['slug']);

            if (! isset($modules[$module])) {
                $modules[$module] = [
                    'module' => $module,
                    'label' => self::MODULE_LABELS[$module] ?? ucfirst(str_replace('_', ' ', $module)),
                    'permissions' => [],
                ];
            }

            $modules[$module]['permissions'][$action] = [
                'id' => (int) $permission['id'],
                'slug' => $permission['slug'],
                'name' => $permission['name'],
                'description' => $permission['description'],
                'action' => $action,
                'action_label' => self::ACTION_LABELS[$action] ?? ucfirst($action),
                'assigned' => in_array((int) $permission['id'], $assignedIds, true),
            ];
        }

        $moduleRows = [];
        foreach ($modules as $module => $data) {
            $cells = [];
            foreach (self::ACTION_ORDER as $action) {
                $cells[$action] = $data['permissions'][$action] ?? null;
            }

            $moduleRows[] = [
                'module' => $module,
                'label' => $data['label'],
                'actions' => $cells,
            ];
        }

        return [
            'roles' => array_map(static function (array $role): array {
                return [
                    'id' => (int) $role['id'],
                    'name' => $role['name'],
                    'slug' => $role['slug'],
                    'scope' => $role['scope'] ?? 'global',
                    'status' => $role['status'] ?? 'active',
                    'is_system' => (bool) ($role['is_system'] ?? false),
                ];
            }, $roles),
            'selected_role_id' => $selectedRoleId,
            'selected_role' => $selectedRole ? [
                'id' => (int) $selectedRole['id'],
                'name' => $selectedRole['name'],
                'slug' => $selectedRole['slug'],
                'scope' => $selectedRole['scope'] ?? 'global',
                'status' => $selectedRole['status'] ?? 'active',
                'is_system' => (bool) ($selectedRole['is_system'] ?? false),
            ] : null,
            'filters' => [
                'module' => $moduleFilter,
            ],
            'actions' => array_map(static fn (string $action): array => [
                'key' => $action,
                'label' => self::ACTION_LABELS[$action] ?? ucfirst($action),
            ], self::ACTION_ORDER),
            'modules' => $moduleRows,
        ];
    }

    public function syncRolePermissions(int $roleId, array $permissionIds): array
    {
        $this->rolePermissions->syncPermissionsForRole($roleId, $permissionIds);

        return $this->buildMatrix($roleId);
    }

    public function findPermissionIdsForRole(int $roleId): array
    {
        return array_map(
            'intval',
            $this->rolePermissions
                ->select('permission_id')
                ->where('role_id', $roleId)
                ->findColumn('permission_id') ?: []
        );
    }

    private function resolveActionFromSlug(string $slug): string
    {
        $parts = explode('.', $slug);
        return $parts[1] ?? 'view';
    }
}
