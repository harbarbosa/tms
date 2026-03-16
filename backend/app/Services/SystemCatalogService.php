<?php

namespace App\Services;

use App\Models\SystemCatalogItemModel;

class SystemCatalogService
{
    private const GLOBAL_SCOPE = 'global';

    private const COMPANY_SCOPE = 'company';

    private const DEFINITIONS = [
        'vehicle_types' => ['label' => 'Tipos de veiculo', 'section' => 'Frota', 'default_scope' => 'company'],
        'body_types' => ['label' => 'Tipos de carroceria', 'section' => 'Frota', 'default_scope' => 'company'],
        'incident_types' => ['label' => 'Tipos de ocorrencia', 'section' => 'Operacao', 'default_scope' => 'company'],
        'document_types' => ['label' => 'Tipos de documento', 'section' => 'Documentos', 'default_scope' => 'company'],
        'transport_order_statuses' => ['label' => 'Status de pedido', 'section' => 'Status', 'default_scope' => 'company'],
        'load_statuses' => ['label' => 'Status de carga', 'section' => 'Status', 'default_scope' => 'company'],
        'pickup_schedule_statuses' => ['label' => 'Status de agendamento', 'section' => 'Status', 'default_scope' => 'company'],
        'vehicle_checkin_statuses' => ['label' => 'Status de check-in', 'section' => 'Status', 'default_scope' => 'company'],
        'payment_methods' => ['label' => 'Formas de pagamento', 'section' => 'Financeiro', 'default_scope' => 'company'],
        'financial_block_reasons' => ['label' => 'Motivos de bloqueio financeiro', 'section' => 'Financeiro', 'default_scope' => 'company'],
        'docks' => ['label' => 'Docas', 'section' => 'Operacao', 'default_scope' => 'company'],
        'operational_units' => ['label' => 'Unidades operacionais', 'section' => 'Operacao', 'default_scope' => 'company'],
    ];

    private const DEFAULT_ITEMS = [
        'vehicle_types' => ['CAVALO', 'TRUCK', 'TOCO', 'VUC', 'BITREM', 'CARRETA'],
        'body_types' => ['BAU', 'SIDER', 'GRANELEIRO', 'TANQUE', 'PORTA_CONTAINER'],
        'incident_types' => ['atraso', 'avaria', 'recusa', 'devolucao', 'extravio', 'problema_operacional'],
        'document_types' => ['CTe', 'MDFe', 'Nota Fiscal', 'Comprovante de Entrega', 'Outros'],
        'transport_order_statuses' => ['pendente', 'em_planejamento', 'cotacao', 'contratado'],
        'load_statuses' => ['planejada', 'em_montagem', 'pronta'],
        'pickup_schedule_statuses' => ['agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'ausente'],
        'vehicle_checkin_statuses' => ['aguardando', 'chegou', 'em_doca', 'carregando', 'finalizado', 'recusado'],
        'payment_methods' => ['pix', 'ted', 'boleto', 'deposito', 'outros'],
        'financial_block_reasons' => ['Divergencia de auditoria', 'Documento pendente', 'Aprovacao pendente', 'Inconsistencia operacional'],
        'docks' => ['Doca 01', 'Doca 02', 'Doca 03'],
        'operational_units' => ['CD Matriz', 'CD Sao Paulo', 'Hub Regional Sul'],
    ];

    public function __construct(private readonly SystemCatalogItemModel $catalogs = new SystemCatalogItemModel())
    {
    }

    public function definitions(): array
    {
        return self::DEFINITIONS;
    }

    public function getCatalogItems(int $companyId, string $catalogType, bool $activeOnly = true): array
    {
        $companyItems = $this->fetchCatalog(self::COMPANY_SCOPE, $companyId, $catalogType, $activeOnly);

        if ($companyItems !== []) {
            return $companyItems;
        }

        $globalItems = $this->fetchCatalog(self::GLOBAL_SCOPE, null, $catalogType, $activeOnly);

        if ($globalItems !== []) {
            return $globalItems;
        }

        return $this->buildDefaultItems($catalogType);
    }

    public function groupedOptions(int $companyId, array $catalogTypes): array
    {
        $options = [];

        foreach ($catalogTypes as $catalogType) {
            $options[$catalogType] = $this->getCatalogItems($companyId, $catalogType);
        }

        return $options;
    }

    private function fetchCatalog(string $scope, ?int $companyId, string $catalogType, bool $activeOnly): array
    {
        $builder = $this->catalogs
            ->where('scope', $scope)
            ->where('catalog_type', $catalogType)
            ->orderBy('sort_order', 'ASC')
            ->orderBy('label', 'ASC');

        if ($companyId === null) {
            $builder->where('company_id', null);
        } else {
            $builder->where('company_id', $companyId);
        }

        if ($activeOnly) {
            $builder->where('status', 'active');
        }

        $items = $builder->findAll();

        return array_map(static function (array $item): array {
            $metadata = json_decode((string) ($item['metadata_json'] ?? '{}'), true);

            return [
                'id' => $item['id'],
                'scope' => $item['scope'],
                'company_id' => $item['company_id'],
                'catalog_type' => $item['catalog_type'],
                'code' => $item['code'],
                'label' => $item['label'],
                'description' => $item['description'],
                'sort_order' => (int) ($item['sort_order'] ?? 0),
                'status' => $item['status'],
                'metadata' => is_array($metadata) ? $metadata : [],
            ];
        }, $items);
    }

    private function buildDefaultItems(string $catalogType): array
    {
        $values = self::DEFAULT_ITEMS[$catalogType] ?? [];

        return array_map(static function (string $value, int $index) use ($catalogType): array {
            return [
                'id' => null,
                'scope' => self::GLOBAL_SCOPE,
                'company_id' => null,
                'catalog_type' => $catalogType,
                'code' => $value,
                'label' => $value,
                'description' => null,
                'sort_order' => $index + 1,
                'status' => 'active',
                'metadata' => [],
            ];
        }, $values, array_keys($values));
    }
}
