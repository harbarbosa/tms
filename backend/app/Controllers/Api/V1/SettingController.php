<?php

namespace App\Controllers\Api\V1;

use App\Models\CompanyModel;
use App\Models\SystemSettingModel;
use App\Services\SystemCatalogService;
use App\Validation\SettingsValidation;

class SettingController extends BaseApiController
{
    private const GLOBAL_SCOPE = 'global';

    private const COMPANY_SCOPE = 'company';

    private const GLOBAL_DEFAULTS = [
        'general' => [
            'system_name' => 'TMS Platform',
            'logo_url' => '',
            'contact_email' => 'contato@tms.local',
        ],
        'localization' => [
            'timezone' => 'America/Sao_Paulo',
            'date_format' => 'DD/MM/YYYY',
            'time_format' => 'HH:mm',
        ],
        'upload_rules' => [
            'max_file_size_mb' => 10,
            'allowed_extensions' => 'pdf,jpg,jpeg,png,xml',
        ],
    ];

    private const COMPANY_DEFAULTS = [
        'default_statuses' => [
            'transport_order_default_status' => 'pendente',
            'load_default_status' => 'planejada',
            'pickup_schedule_default_status' => 'agendado',
            'vehicle_checkin_default_status' => 'aguardando',
        ],
        'upload_rules' => [
            'company_upload_max_file_size_mb' => 15,
            'company_allowed_extensions' => 'pdf,jpg,jpeg,png,xml',
        ],
        'operational' => [
            'delivery_tolerance_hours' => 2,
            'pickup_window_minutes' => 30,
            'auto_block_divergent_financial' => true,
        ],
    ];

    public function __construct(
        private readonly SystemSettingModel $settings = new SystemSettingModel(),
        private readonly CompanyModel $companies = new CompanyModel(),
        private readonly SystemCatalogService $catalogService = new SystemCatalogService()
    ) {
    }

    public function show()
    {
        $this->requirePermission('settings.view');
        $company = $this->authContext->getCompany();
        $companyId = (int) ($company['id'] ?? 0);

        return $this->respondSuccess([
            'global' => $this->resolveGlobalSettings(),
            'company' => $this->resolveCompanySettings($companyId),
            'companyInfo' => [
                'id' => $companyId,
                'name' => $company['name'] ?? 'Empresa atual',
            ],
            'options' => $this->buildOptions(),
            'capabilities' => [
                'can_manage_global' => $this->getCurrentRole() === 'master_admin' && $this->hasPermission('settings.manage'),
                'can_manage_company' => $this->hasPermission('settings.manage'),
            ],
        ], 'Configuracoes carregadas com sucesso.');
    }

    public function updateGlobal()
    {
        $this->requirePermission('settings.manage');

        if ($this->getCurrentRole() !== 'master_admin') {
            return $this->respondError('Nao foi possivel atualizar as configuracoes globais.', [
                'scope' => 'Apenas o administrador master pode editar configuracoes globais.',
            ], 403);
        }

        $payload = $this->request->getJSON(true) ?? [];
        $flat = $this->flattenGlobalPayload($payload);

        if (! $this->validateData($flat, SettingsValidation::globalRules())) {
            return $this->respondError('Nao foi possivel atualizar as configuracoes globais.', $this->validator->getErrors(), 422);
        }

        $this->saveScopeCategory(self::GLOBAL_SCOPE, null, 'general', [
            'system_name' => trim((string) $flat['system_name']),
            'logo_url' => trim((string) $flat['logo_url']),
            'contact_email' => trim((string) $flat['contact_email']),
        ]);

        $this->saveScopeCategory(self::GLOBAL_SCOPE, null, 'localization', [
            'timezone' => trim((string) $flat['timezone']),
            'date_format' => trim((string) $flat['date_format']),
            'time_format' => trim((string) $flat['time_format']),
        ]);

        $this->saveScopeCategory(self::GLOBAL_SCOPE, null, 'upload_rules', [
            'max_file_size_mb' => (int) $flat['max_file_size_mb'],
            'allowed_extensions' => trim((string) $flat['allowed_extensions']),
        ]);

        return $this->respondSuccess($this->resolveGlobalSettings(), 'Configuracoes globais atualizadas com sucesso.');
    }

    public function updateCompany()
    {
        $this->requirePermission('settings.manage');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $payload = $this->request->getJSON(true) ?? [];
        $flat = $this->flattenCompanyPayload($payload);

        if (! $this->validateData($flat, SettingsValidation::companyRules())) {
            return $this->respondError('Nao foi possivel atualizar as configuracoes da empresa.', $this->validator->getErrors(), 422);
        }

        $this->saveScopeCategory(self::COMPANY_SCOPE, $companyId, 'default_statuses', [
            'transport_order_default_status' => trim((string) $flat['transport_order_default_status']),
            'load_default_status' => trim((string) $flat['load_default_status']),
            'pickup_schedule_default_status' => trim((string) $flat['pickup_schedule_default_status']),
            'vehicle_checkin_default_status' => trim((string) $flat['vehicle_checkin_default_status']),
        ]);

        $this->saveScopeCategory(self::COMPANY_SCOPE, $companyId, 'upload_rules', [
            'company_upload_max_file_size_mb' => (int) $flat['company_upload_max_file_size_mb'],
            'company_allowed_extensions' => trim((string) $flat['company_allowed_extensions']),
        ]);

        $this->saveScopeCategory(self::COMPANY_SCOPE, $companyId, 'operational', [
            'delivery_tolerance_hours' => (int) $flat['delivery_tolerance_hours'],
            'pickup_window_minutes' => (int) $flat['pickup_window_minutes'],
            'auto_block_divergent_financial' => $flat['auto_block_divergent_financial'] === '1',
        ]);

        $this->companies->update($companyId, [
            'limite_usuarios' => (int) $flat['limite_usuarios'],
            'limite_transportadoras' => (int) $flat['limite_transportadoras'],
            'limite_veiculos' => (int) $flat['limite_veiculos'],
            'limite_motoristas' => (int) $flat['limite_motoristas'],
        ]);

        return $this->respondSuccess($this->resolveCompanySettings($companyId), 'Configuracoes da empresa atualizadas com sucesso.');
    }

    private function resolveGlobalSettings(): array
    {
        $rows = $this->settings
            ->where('scope', self::GLOBAL_SCOPE)
            ->where('company_id', null)
            ->findAll();

        return $this->mergeRowsWithDefaults(self::GLOBAL_DEFAULTS, $rows);
    }

    private function resolveCompanySettings(int $companyId): array
    {
        $rows = $this->settings
            ->where('scope', self::COMPANY_SCOPE)
            ->where('company_id', $companyId)
            ->findAll();

        $companySettings = $this->mergeRowsWithDefaults(self::COMPANY_DEFAULTS, $rows);
        $company = $this->companies->find($companyId);

        $companySettings['limits'] = [
            'limite_usuarios' => (int) ($company['limite_usuarios'] ?? 10),
            'limite_transportadoras' => (int) ($company['limite_transportadoras'] ?? 10),
            'limite_veiculos' => (int) ($company['limite_veiculos'] ?? 50),
            'limite_motoristas' => (int) ($company['limite_motoristas'] ?? 50),
        ];

        return $companySettings;
    }

    private function mergeRowsWithDefaults(array $defaults, array $rows): array
    {
        $settings = $defaults;

        foreach ($rows as $row) {
            $decoded = json_decode((string) ($row['settings_json'] ?? '{}'), true);

            if (! is_array($decoded)) {
                $decoded = [];
            }

            $settings[$row['category']] = [
                ...($settings[$row['category']] ?? []),
                ...$decoded,
            ];
        }

        return $settings;
    }

    private function saveScopeCategory(string $scope, ?int $companyId, string $category, array $settings): void
    {
        $existing = $this->settings
            ->where('scope', $scope)
            ->where('company_id', $companyId)
            ->where('category', $category)
            ->first();

        $payload = [
            'scope' => $scope,
            'company_id' => $companyId,
            'category' => $category,
            'settings_json' => json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];

        if ($existing) {
            $this->settings->update((int) $existing['id'], $payload);
            return;
        }

        $this->settings->insert($payload);
    }

    private function flattenGlobalPayload(array $payload): array
    {
        $general = $payload['general'] ?? [];
        $localization = $payload['localization'] ?? [];
        $uploadRules = $payload['upload_rules'] ?? [];

        return [
            'system_name' => trim((string) ($general['system_name'] ?? '')),
            'logo_url' => trim((string) ($general['logo_url'] ?? '')),
            'contact_email' => trim((string) ($general['contact_email'] ?? '')),
            'timezone' => trim((string) ($localization['timezone'] ?? '')),
            'date_format' => trim((string) ($localization['date_format'] ?? '')),
            'time_format' => trim((string) ($localization['time_format'] ?? '')),
            'max_file_size_mb' => $uploadRules['max_file_size_mb'] ?? '',
            'allowed_extensions' => trim((string) ($uploadRules['allowed_extensions'] ?? '')),
        ];
    }

    private function flattenCompanyPayload(array $payload): array
    {
        $defaults = $payload['default_statuses'] ?? [];
        $uploadRules = $payload['upload_rules'] ?? [];
        $operational = $payload['operational'] ?? [];
        $limits = $payload['limits'] ?? [];

        return [
            'transport_order_default_status' => trim((string) ($defaults['transport_order_default_status'] ?? '')),
            'load_default_status' => trim((string) ($defaults['load_default_status'] ?? '')),
            'pickup_schedule_default_status' => trim((string) ($defaults['pickup_schedule_default_status'] ?? '')),
            'vehicle_checkin_default_status' => trim((string) ($defaults['vehicle_checkin_default_status'] ?? '')),
            'company_upload_max_file_size_mb' => $uploadRules['company_upload_max_file_size_mb'] ?? '',
            'company_allowed_extensions' => trim((string) ($uploadRules['company_allowed_extensions'] ?? '')),
            'delivery_tolerance_hours' => $operational['delivery_tolerance_hours'] ?? '',
            'pickup_window_minutes' => $operational['pickup_window_minutes'] ?? '',
            'auto_block_divergent_financial' => ! empty($operational['auto_block_divergent_financial']) ? '1' : '0',
            'limite_usuarios' => $limits['limite_usuarios'] ?? '',
            'limite_transportadoras' => $limits['limite_transportadoras'] ?? '',
            'limite_veiculos' => $limits['limite_veiculos'] ?? '',
            'limite_motoristas' => $limits['limite_motoristas'] ?? '',
        ];
    }

    private function buildOptions(): array
    {
        return [
            'timezones' => ['America/Sao_Paulo', 'UTC', 'America/Bogota', 'America/Lima'],
            'date_formats' => ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'],
            'time_formats' => ['HH:mm', 'HH:mm:ss'],
            'transport_order_statuses' => array_map(static fn (array $item): string => $item['label'], $this->catalogService->getCatalogItems((int) ($this->authContext->getCompany()['id'] ?? 0), 'transport_order_statuses')),
            'load_statuses' => array_map(static fn (array $item): string => $item['label'], $this->catalogService->getCatalogItems((int) ($this->authContext->getCompany()['id'] ?? 0), 'load_statuses')),
            'pickup_schedule_statuses' => array_map(static fn (array $item): string => $item['label'], $this->catalogService->getCatalogItems((int) ($this->authContext->getCompany()['id'] ?? 0), 'pickup_schedule_statuses')),
            'vehicle_checkin_statuses' => array_map(static fn (array $item): string => $item['label'], $this->catalogService->getCatalogItems((int) ($this->authContext->getCompany()['id'] ?? 0), 'vehicle_checkin_statuses')),
        ];
    }
}
