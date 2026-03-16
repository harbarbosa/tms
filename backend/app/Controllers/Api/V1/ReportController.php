<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\I18n\Time;

class ReportController extends BaseApiController
{
    private const REPORT_KEYS = [
        'orders-by-status',
        'loads-by-period',
        'transport-documents-by-status',
        'delivery-performance',
        'incidents-by-type',
        'audits-by-status',
        'pending-proofs',
        'freight-by-transporter',
        'freight-by-route',
        'freight-by-client',
        'freight-divergence-by-period',
        'top-incident-carriers',
        'best-performance-carriers',
        'average-delivery-time',
        'sla-ranking-by-transporter',
    ];

    public function options()
    {
        $this->requirePermission('reports.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        $reports = [
            ['key' => 'orders-by-status', 'title' => 'Pedidos por status', 'description' => 'Consolida volume, peso e valor de pedidos por status operacional.', 'section' => 'operational'],
            ['key' => 'loads-by-period', 'title' => 'Cargas por periodo', 'description' => 'Lista cargas previstas no periodo com origem, destino e totais.', 'section' => 'operational'],
            ['key' => 'transport-documents-by-status', 'title' => 'Ordens de transporte por status', 'description' => 'Acompanha OTs por status, janela e transportadora.', 'section' => 'operational'],
            ['key' => 'delivery-performance', 'title' => 'Entregas no prazo e fora do prazo', 'description' => 'Compara entrega real versus entrega prevista.', 'section' => 'operational'],
            ['key' => 'incidents-by-type', 'title' => 'Ocorrencias por tipo', 'description' => 'Agrupa tratativas operacionais por tipo e status.', 'section' => 'operational'],
            ['key' => 'audits-by-status', 'title' => 'Auditorias por status', 'description' => 'Analisa divergencias e status de auditoria de frete.', 'section' => 'financial'],
            ['key' => 'pending-proofs', 'title' => 'Comprovantes pendentes', 'description' => 'Lista viagens sem comprovante de entrega registrado.', 'section' => 'operational'],
            ['key' => 'freight-by-transporter', 'title' => 'Frete por transportadora', 'description' => 'Total contratado e quantidade de viagens por transportadora.', 'section' => 'financial'],
            ['key' => 'freight-by-route', 'title' => 'Frete por rota', 'description' => 'Consolida frete por corredor logistico de origem e destino.', 'section' => 'financial'],
            ['key' => 'freight-by-client', 'title' => 'Frete por cliente', 'description' => 'Analisa concentracao de frete por cliente embarcador.', 'section' => 'financial'],
            ['key' => 'freight-divergence-by-period', 'title' => 'Divergencia de frete por periodo', 'description' => 'Resume valor divergente e volume de auditorias no periodo.', 'section' => 'financial'],
            ['key' => 'top-incident-carriers', 'title' => 'Transportadoras com mais ocorrencias', 'description' => 'Ranking operacional das transportadoras com maior incidência.', 'section' => 'performance'],
            ['key' => 'best-performance-carriers', 'title' => 'Transportadoras com melhor performance', 'description' => 'Compara taxa de entrega no prazo por transportadora.', 'section' => 'performance'],
            ['key' => 'average-delivery-time', 'title' => 'Tempo medio de entrega', 'description' => 'Apresenta o ciclo medio de entrega por transportadora.', 'section' => 'performance'],
            ['key' => 'sla-ranking-by-transporter', 'title' => 'Ranking de SLA por transportadora', 'description' => 'Mostra o SLA consolidado das transportadoras no periodo.', 'section' => 'performance'],
        ];

        return $this->respondSuccess([
            'reports' => $reports,
            'companies' => [
                [
                    'id' => $companyId,
                    'name' => $this->authContext->getCompany()['name'] ?? 'Empresa atual',
                ],
            ],
            'transporters' => $this->db->table('carriers')
                ->select('id, razao_social')
                ->where('company_id', $companyId)
                ->where('deleted_at', null)
                ->orderBy('razao_social', 'ASC')
                ->get()
                ->getResultArray(),
            'statuses' => [
                'orders' => ['pendente', 'em_planejamento', 'cotacao', 'contratado', 'em_transporte', 'entregue', 'cancelado'],
                'loads' => ['planejada', 'em_montagem', 'pronta', 'em_transporte', 'finalizada', 'cancelada'],
                'transport_documents' => ['programada', 'em_transporte', 'entregue', 'cancelado'],
                'deliveries' => ['no_prazo', 'fora_do_prazo'],
                'incidents' => ['aberta', 'em_tratativa', 'resolvida', 'cancelada'],
                'audits' => ['pendente', 'aprovado', 'divergente', 'recusado'],
                'pending_proofs' => ['pendente', 'critico'],
                'financial' => ['pendente', 'aprovado', 'divergente', 'recusado'],
                'performance' => ['no_prazo', 'fora_do_prazo', 'critico'],
            ],
        ], 'Opcoes de relatorios carregadas com sucesso.');
    }

    public function ordersByStatus()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('transport_orders')
            ->select('status, COUNT(*) as total_pedidos, SUM(peso_total) as peso_total, SUM(valor_mercadoria) as valor_total')
            ->where('company_id', $filters['company_id'])
            ->where('deleted_at', null)
            ->where('DATE(created_at) >=', $filters['start_date'])
            ->where('DATE(created_at) <=', $filters['end_date'])
            ->groupBy('status')
            ->orderBy('status', 'ASC');

        if ($filters['status'] !== '') {
            $builder->where('status', $filters['status']);
        }

        return $this->respondReport(
            'orders-by-status',
            'Pedidos por status',
            $builder->get()->getResultArray(),
            [
                ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
                ['key' => 'total_pedidos', 'label' => 'Pedidos', 'type' => 'number'],
                ['key' => 'peso_total', 'label' => 'Peso total', 'type' => 'decimal'],
                ['key' => 'valor_total', 'label' => 'Valor mercadoria', 'type' => 'currency'],
            ],
            $filters,
            false
        );
    }

    public function loadsByPeriod()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('loads')
            ->select('loads.id, loads.codigo_carga, loads.origem_cidade, loads.origem_estado, loads.destino_cidade, loads.destino_estado, loads.data_prevista_saida, loads.data_prevista_entrega, loads.peso_total, loads.volume_total, loads.valor_total, loads.status')
            ->where('loads.company_id', $filters['company_id'])
            ->where('loads.deleted_at', null)
            ->where('loads.data_prevista_saida >=', $filters['start_date'])
            ->where('loads.data_prevista_saida <=', $filters['end_date'])
            ->orderBy('loads.data_prevista_saida', 'DESC')
            ->orderBy('loads.id', 'DESC');

        if ($filters['status'] !== '') {
            $builder->where('loads.status', $filters['status']);
        }

        return $this->respondPaginatedReport(
            'loads-by-period',
            'Cargas por periodo',
            $builder,
            [
                ['key' => 'codigo_carga', 'label' => 'Carga'],
                ['key' => 'origem_cidade', 'label' => 'Origem'],
                ['key' => 'destino_cidade', 'label' => 'Destino'],
                ['key' => 'data_prevista_saida', 'label' => 'Saida prevista', 'type' => 'date'],
                ['key' => 'data_prevista_entrega', 'label' => 'Entrega prevista', 'type' => 'date'],
                ['key' => 'peso_total', 'label' => 'Peso', 'type' => 'decimal'],
                ['key' => 'valor_total', 'label' => 'Valor', 'type' => 'currency'],
                ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
            ],
            $filters
        );
    }

    public function transportDocumentsByStatus()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('transport_documents')
            ->select('transport_documents.id, transport_documents.numero_ot, transport_documents.data_coleta_prevista, transport_documents.data_entrega_prevista, transport_documents.valor_frete_contratado, transport_documents.status, carriers.razao_social as transportadora')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('transport_documents.company_id', $filters['company_id'])
            ->where('transport_documents.deleted_at', null)
            ->where('transport_documents.data_coleta_prevista >=', $filters['start_date'])
            ->where('transport_documents.data_coleta_prevista <=', $filters['end_date'])
            ->orderBy('transport_documents.data_coleta_prevista', 'DESC')
            ->orderBy('transport_documents.id', 'DESC');

        if ($filters['status'] !== '') {
            $builder->where('transport_documents.status', $filters['status']);
        }

        if ($filters['transporter_id'] > 0) {
            $builder->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        return $this->respondPaginatedReport(
            'transport-documents-by-status',
            'Ordens de transporte por status',
            $builder,
            [
                ['key' => 'numero_ot', 'label' => 'OT'],
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'data_coleta_prevista', 'label' => 'Coleta', 'type' => 'date'],
                ['key' => 'data_entrega_prevista', 'label' => 'Entrega', 'type' => 'date'],
                ['key' => 'valor_frete_contratado', 'label' => 'Frete contratado', 'type' => 'currency'],
                ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
            ],
            $filters
        );
    }

    public function deliveryPerformance()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('delivery_receipts')
            ->select("delivery_receipts.id, transport_documents.numero_ot, carriers.razao_social as transportadora, transport_documents.data_entrega_prevista, DATE(delivery_receipts.data_entrega_real) as data_entrega_real, delivery_receipts.nome_recebedor, CASE WHEN DATE(delivery_receipts.data_entrega_real) <= transport_documents.data_entrega_prevista THEN 'no_prazo' ELSE 'fora_do_prazo' END as prazo_status", false)
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('delivery_receipts.company_id', $filters['company_id'])
            ->where('delivery_receipts.deleted_at', null)
            ->where('DATE(delivery_receipts.data_entrega_real) >=', $filters['start_date'])
            ->where('DATE(delivery_receipts.data_entrega_real) <=', $filters['end_date'])
            ->orderBy('delivery_receipts.data_entrega_real', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $builder->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        if ($filters['status'] === 'no_prazo') {
            $builder->where('DATE(delivery_receipts.data_entrega_real) <= transport_documents.data_entrega_prevista', null, false);
        }

        if ($filters['status'] === 'fora_do_prazo') {
            $builder->where('DATE(delivery_receipts.data_entrega_real) > transport_documents.data_entrega_prevista', null, false);
        }

        return $this->respondPaginatedReport(
            'delivery-performance',
            'Entregas no prazo e fora do prazo',
            $builder,
            [
                ['key' => 'numero_ot', 'label' => 'OT'],
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'data_entrega_prevista', 'label' => 'Prevista', 'type' => 'date'],
                ['key' => 'data_entrega_real', 'label' => 'Real', 'type' => 'date'],
                ['key' => 'prazo_status', 'label' => 'Prazo', 'type' => 'status'],
                ['key' => 'nome_recebedor', 'label' => 'Recebedor'],
            ],
            $filters
        );
    }

    public function incidentsByType()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('incidents')
            ->select('incidents.tipo_ocorrencia, incidents.status, COUNT(*) as total_ocorrencias, MAX(incidents.occurred_at) as ultima_ocorrencia')
            ->join('transport_documents', 'transport_documents.id = incidents.transport_document_id')
            ->where('incidents.company_id', $filters['company_id'])
            ->where('incidents.deleted_at', null)
            ->where('DATE(incidents.occurred_at) >=', $filters['start_date'])
            ->where('DATE(incidents.occurred_at) <=', $filters['end_date'])
            ->groupBy(['incidents.tipo_ocorrencia', 'incidents.status'])
            ->orderBy('total_ocorrencias', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $builder->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        if ($filters['status'] !== '') {
            $builder->where('incidents.status', $filters['status']);
        }

        return $this->respondReport(
            'incidents-by-type',
            'Ocorrencias por tipo',
            $builder->get()->getResultArray(),
            [
                ['key' => 'tipo_ocorrencia', 'label' => 'Tipo'],
                ['key' => 'status', 'label' => 'Status', 'type' => 'status'],
                ['key' => 'total_ocorrencias', 'label' => 'Ocorrencias', 'type' => 'number'],
                ['key' => 'ultima_ocorrencia', 'label' => 'Ultima ocorrencia', 'type' => 'datetime'],
            ],
            $filters,
            false
        );
    }

    public function auditsByStatus()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('freight_audits')
            ->select('freight_audits.id, freight_audits.status_auditoria, freight_audits.valor_contratado, freight_audits.valor_cobrado, freight_audits.diferenca_valor, freight_audits.data_auditoria, transport_documents.numero_ot, carriers.razao_social as transportadora')
            ->join('transport_documents', 'transport_documents.id = freight_audits.ordem_transporte_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('freight_audits.company_id', $filters['company_id'])
            ->where('freight_audits.deleted_at', null)
            ->where('DATE(freight_audits.created_at) >=', $filters['start_date'])
            ->where('DATE(freight_audits.created_at) <=', $filters['end_date'])
            ->orderBy('freight_audits.id', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $builder->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        if ($filters['status'] !== '') {
            $builder->where('freight_audits.status_auditoria', $filters['status']);
        }

        return $this->respondPaginatedReport(
            'audits-by-status',
            'Auditorias por status',
            $builder,
            [
                ['key' => 'numero_ot', 'label' => 'OT'],
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'status_auditoria', 'label' => 'Status', 'type' => 'status'],
                ['key' => 'valor_contratado', 'label' => 'Contratado', 'type' => 'currency'],
                ['key' => 'valor_cobrado', 'label' => 'Cobrado', 'type' => 'currency'],
                ['key' => 'diferenca_valor', 'label' => 'Diferenca', 'type' => 'currency'],
                ['key' => 'data_auditoria', 'label' => 'Data auditoria', 'type' => 'datetime'],
            ],
            $filters
        );
    }

    public function pendingProofs()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $builder = $this->db->table('transport_documents')
            ->select("transport_documents.id, transport_documents.numero_ot, carriers.razao_social as transportadora, transport_documents.data_entrega_prevista, transport_documents.status, CASE WHEN transport_documents.data_entrega_prevista < CURDATE() THEN 'critico' ELSE 'pendente' END as prioridade", false)
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->join('delivery_receipts', 'delivery_receipts.ordem_transporte_id = transport_documents.id AND delivery_receipts.deleted_at IS NULL', 'left')
            ->where('transport_documents.company_id', $filters['company_id'])
            ->where('transport_documents.deleted_at', null)
            ->where('transport_documents.data_entrega_prevista >=', $filters['start_date'])
            ->where('transport_documents.data_entrega_prevista <=', $filters['end_date'])
            ->where('delivery_receipts.id', null)
            ->orderBy('transport_documents.data_entrega_prevista', 'ASC');

        if ($filters['transporter_id'] > 0) {
            $builder->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        if ($filters['status'] === 'critico') {
            $builder->where('transport_documents.data_entrega_prevista <', Time::now()->toDateString());
        }

        if ($filters['status'] === 'pendente') {
            $builder->where('transport_documents.data_entrega_prevista >=', Time::now()->toDateString());
        }

        return $this->respondPaginatedReport(
            'pending-proofs',
            'Comprovantes pendentes',
            $builder,
            [
                ['key' => 'numero_ot', 'label' => 'OT'],
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'data_entrega_prevista', 'label' => 'Entrega prevista', 'type' => 'date'],
                ['key' => 'status', 'label' => 'Status OT', 'type' => 'status'],
                ['key' => 'prioridade', 'label' => 'Prioridade', 'type' => 'status'],
            ],
            $filters
        );
    }

    public function freightByTransporter()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $items = $this->db->table('transport_documents')
            ->select('carriers.razao_social as transportadora, COUNT(*) as total_ots, SUM(transport_documents.valor_frete_contratado) as valor_total_frete, AVG(transport_documents.valor_frete_contratado) as ticket_medio')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('transport_documents.company_id', $filters['company_id'])
            ->where('transport_documents.deleted_at', null)
            ->where('transport_documents.data_coleta_prevista >=', $filters['start_date'])
            ->where('transport_documents.data_coleta_prevista <=', $filters['end_date'])
            ->groupBy('carriers.razao_social')
            ->orderBy('valor_total_frete', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $items->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        $items = $items->get()->getResultArray();

        return $this->respondReport(
            'freight-by-transporter',
            'Frete por transportadora',
            $items,
            [
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'total_ots', 'label' => 'OTs', 'type' => 'number'],
                ['key' => 'valor_total_frete', 'label' => 'Frete total', 'type' => 'currency'],
                ['key' => 'ticket_medio', 'label' => 'Ticket medio', 'type' => 'currency'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'bar',
                'title' => 'Frete total por transportadora',
                'labels' => array_map(static fn (array $row) => $row['transportadora'], $items),
                'datasets' => [
                    [
                        'label' => 'Frete total',
                        'data' => array_map(static fn (array $row) => (float) $row['valor_total_frete'], $items),
                    ],
                ],
            ]
        );
    }

    public function freightByRoute()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $items = $this->db->table('transport_documents')
            ->select("CONCAT(COALESCE(loads.origem_cidade, 'Sem origem'), ' / ', COALESCE(loads.origem_estado, '-'), ' -> ', COALESCE(loads.destino_cidade, transport_orders.cidade_entrega, 'Sem destino'), ' / ', COALESCE(loads.destino_estado, transport_orders.estado_entrega, '-')) as rota, COUNT(*) as total_viagens, SUM(transport_documents.valor_frete_contratado) as valor_total", false)
            ->join('loads', 'loads.id = transport_documents.carga_id', 'left')
            ->join('transport_orders', 'transport_orders.id = transport_documents.pedido_id', 'left')
            ->where('transport_documents.company_id', $filters['company_id'])
            ->where('transport_documents.deleted_at', null)
            ->where('transport_documents.data_coleta_prevista >=', $filters['start_date'])
            ->where('transport_documents.data_coleta_prevista <=', $filters['end_date'])
            ->groupBy('rota')
            ->orderBy('valor_total', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $items->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        $items = $items->get()->getResultArray();

        return $this->respondReport(
            'freight-by-route',
            'Frete por rota',
            $items,
            [
                ['key' => 'rota', 'label' => 'Rota'],
                ['key' => 'total_viagens', 'label' => 'Viagens', 'type' => 'number'],
                ['key' => 'valor_total', 'label' => 'Frete total', 'type' => 'currency'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'bar',
                'title' => 'Frete por rota',
                'labels' => array_map(static fn (array $row) => $row['rota'], $items),
                'datasets' => [
                    [
                        'label' => 'Frete total',
                        'data' => array_map(static fn (array $row) => (float) $row['valor_total'], $items),
                    ],
                ],
            ]
        );
    }

    public function freightByClient()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $items = $this->db->table('transport_documents')
            ->select('transport_orders.cliente_nome, COUNT(*) as total_ots, SUM(transport_documents.valor_frete_contratado) as valor_total_frete, AVG(transport_documents.valor_frete_contratado) as ticket_medio')
            ->join('transport_orders', 'transport_orders.id = transport_documents.pedido_id', 'left')
            ->where('transport_documents.company_id', $filters['company_id'])
            ->where('transport_documents.deleted_at', null)
            ->where('transport_documents.data_coleta_prevista >=', $filters['start_date'])
            ->where('transport_documents.data_coleta_prevista <=', $filters['end_date'])
            ->where('transport_orders.id IS NOT NULL', null, false)
            ->groupBy('transport_orders.cliente_nome')
            ->orderBy('valor_total_frete', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $items->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        $items = $items->get()->getResultArray();

        return $this->respondReport(
            'freight-by-client',
            'Frete por cliente',
            $items,
            [
                ['key' => 'cliente_nome', 'label' => 'Cliente'],
                ['key' => 'total_ots', 'label' => 'OTs', 'type' => 'number'],
                ['key' => 'valor_total_frete', 'label' => 'Frete total', 'type' => 'currency'],
                ['key' => 'ticket_medio', 'label' => 'Ticket medio', 'type' => 'currency'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'doughnut',
                'title' => 'Frete por cliente',
                'labels' => array_map(static fn (array $row) => $row['cliente_nome'], $items),
                'datasets' => [
                    [
                        'label' => 'Frete total',
                        'data' => array_map(static fn (array $row) => (float) $row['valor_total_frete'], $items),
                    ],
                ],
            ]
        );
    }

    public function freightDivergenceByPeriod()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $items = $this->db->table('freight_audits')
            ->select("DATE(COALESCE(freight_audits.data_auditoria, freight_audits.created_at)) as referencia, COUNT(*) as total_auditorias, SUM(CASE WHEN freight_audits.status_auditoria = 'divergente' THEN freight_audits.diferenca_valor ELSE 0 END) as valor_divergente, SUM(CASE WHEN freight_audits.status_auditoria = 'divergente' THEN 1 ELSE 0 END) as total_divergencias", false)
            ->join('transport_documents', 'transport_documents.id = freight_audits.ordem_transporte_id')
            ->where('freight_audits.company_id', $filters['company_id'])
            ->where('freight_audits.deleted_at', null)
            ->where('DATE(COALESCE(freight_audits.data_auditoria, freight_audits.created_at)) >=', $filters['start_date'], false)
            ->where('DATE(COALESCE(freight_audits.data_auditoria, freight_audits.created_at)) <=', $filters['end_date'], false)
            ->groupBy('referencia')
            ->orderBy('referencia', 'ASC');

        if ($filters['transporter_id'] > 0) {
            $items->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        if ($filters['status'] !== '') {
            $items->where('freight_audits.status_auditoria', $filters['status']);
        }

        $items = $items->get()->getResultArray();

        return $this->respondReport(
            'freight-divergence-by-period',
            'Divergencia de frete por periodo',
            $items,
            [
                ['key' => 'referencia', 'label' => 'Data', 'type' => 'date'],
                ['key' => 'total_auditorias', 'label' => 'Auditorias', 'type' => 'number'],
                ['key' => 'total_divergencias', 'label' => 'Divergencias', 'type' => 'number'],
                ['key' => 'valor_divergente', 'label' => 'Valor divergente', 'type' => 'currency'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'line',
                'title' => 'Valor divergente por periodo',
                'labels' => array_map(static fn (array $row) => $row['referencia'], $items),
                'datasets' => [
                    [
                        'label' => 'Valor divergente',
                        'data' => array_map(static fn (array $row) => (float) $row['valor_divergente'], $items),
                    ],
                    [
                        'label' => 'Qtde divergencias',
                        'data' => array_map(static fn (array $row) => (int) $row['total_divergencias'], $items),
                    ],
                ],
            ]
        );
    }

    public function topIncidentCarriers()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();

        $items = $this->db->table('incidents')
            ->select('carriers.razao_social as transportadora, COUNT(*) as total_ocorrencias, SUM(CASE WHEN incidents.status IN (\'aberta\', \'em_tratativa\') THEN 1 ELSE 0 END) as ocorrencias_abertas', false)
            ->join('transport_documents', 'transport_documents.id = incidents.transport_document_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('incidents.company_id', $filters['company_id'])
            ->where('incidents.deleted_at', null)
            ->where('DATE(incidents.occurred_at) >=', $filters['start_date'])
            ->where('DATE(incidents.occurred_at) <=', $filters['end_date'])
            ->groupBy('carriers.razao_social')
            ->orderBy('total_ocorrencias', 'DESC');

        if ($filters['transporter_id'] > 0) {
            $items->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        $items = $items->get()->getResultArray();

        return $this->respondReport(
            'top-incident-carriers',
            'Transportadoras com mais ocorrencias',
            $items,
            [
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'total_ocorrencias', 'label' => 'Ocorrencias', 'type' => 'number'],
                ['key' => 'ocorrencias_abertas', 'label' => 'Abertas', 'type' => 'number'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'bar',
                'title' => 'Ocorrencias por transportadora',
                'labels' => array_map(static fn (array $row) => $row['transportadora'], $items),
                'datasets' => [
                    [
                        'label' => 'Ocorrencias',
                        'data' => array_map(static fn (array $row) => (int) $row['total_ocorrencias'], $items),
                    ],
                ],
            ]
        );
    }

    public function bestPerformanceCarriers()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();
        $items = $this->buildCarrierPerformanceRows($filters);

        usort($items, static fn (array $left, array $right) => ($right['sla_percentual'] <=> $left['sla_percentual']));

        return $this->respondReport(
            'best-performance-carriers',
            'Transportadoras com melhor performance',
            $items,
            [
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'entregas_no_prazo', 'label' => 'No prazo', 'type' => 'number'],
                ['key' => 'entregas_total', 'label' => 'Entregas', 'type' => 'number'],
                ['key' => 'sla_percentual', 'label' => 'SLA %', 'type' => 'decimal'],
                ['key' => 'tempo_medio_dias', 'label' => 'Tempo medio (dias)', 'type' => 'decimal'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'bar',
                'title' => 'SLA por transportadora',
                'labels' => array_map(static fn (array $row) => $row['transportadora'], $items),
                'datasets' => [
                    [
                        'label' => 'SLA %',
                        'data' => array_map(static fn (array $row) => (float) $row['sla_percentual'], $items),
                    ],
                ],
            ]
        );
    }

    public function averageDeliveryTime()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();
        $items = $this->buildCarrierPerformanceRows($filters);

        usort($items, static fn (array $left, array $right) => ($left['tempo_medio_dias'] <=> $right['tempo_medio_dias']));

        return $this->respondReport(
            'average-delivery-time',
            'Tempo medio de entrega',
            $items,
            [
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'tempo_medio_dias', 'label' => 'Tempo medio (dias)', 'type' => 'decimal'],
                ['key' => 'entregas_total', 'label' => 'Entregas', 'type' => 'number'],
                ['key' => 'sla_percentual', 'label' => 'SLA %', 'type' => 'decimal'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'line',
                'title' => 'Tempo medio de entrega por transportadora',
                'labels' => array_map(static fn (array $row) => $row['transportadora'], $items),
                'datasets' => [
                    [
                        'label' => 'Dias',
                        'data' => array_map(static fn (array $row) => (float) $row['tempo_medio_dias'], $items),
                    ],
                ],
            ]
        );
    }

    public function slaRankingByTransporter()
    {
        $this->requirePermission('reports.view');
        $filters = $this->resolveFilters();
        $items = $this->buildCarrierPerformanceRows($filters);

        usort($items, static fn (array $left, array $right) => ($right['sla_percentual'] <=> $left['sla_percentual']));

        foreach ($items as $index => &$item) {
            $item['ranking'] = $index + 1;
        }
        unset($item);

        return $this->respondReport(
            'sla-ranking-by-transporter',
            'Ranking de SLA por transportadora',
            $items,
            [
                ['key' => 'ranking', 'label' => 'Ranking', 'type' => 'number'],
                ['key' => 'transportadora', 'label' => 'Transportadora'],
                ['key' => 'sla_percentual', 'label' => 'SLA %', 'type' => 'decimal'],
                ['key' => 'entregas_no_prazo', 'label' => 'No prazo', 'type' => 'number'],
                ['key' => 'entregas_total', 'label' => 'Entregas', 'type' => 'number'],
            ],
            $filters,
            false,
            0,
            [
                'type' => 'bar',
                'title' => 'Ranking de SLA',
                'labels' => array_map(static fn (array $row) => $row['transportadora'], $items),
                'datasets' => [
                    [
                        'label' => 'SLA %',
                        'data' => array_map(static fn (array $row) => (float) $row['sla_percentual'], $items),
                    ],
                ],
            ]
        );
    }

    public function export(string $reportKey)
    {
        $this->requirePermission('reports.view');

        if (! in_array($reportKey, self::REPORT_KEYS, true)) {
            return $this->respondError('Relatorio solicitado nao existe.', ['report' => 'Chave invalida.'], 404);
        }

        $format = strtolower(trim((string) ($this->request->getGet('format') ?? 'csv')));

        if ($format !== 'csv') {
            return $this->respondError('Formato de exportacao nao suportado.', ['format' => 'Somente CSV esta disponivel nesta fase.'], 422);
        }

        $reportData = match ($reportKey) {
            'orders-by-status' => $this->collectReportData('ordersByStatus'),
            'loads-by-period' => $this->collectReportData('loadsByPeriod'),
            'transport-documents-by-status' => $this->collectReportData('transportDocumentsByStatus'),
            'delivery-performance' => $this->collectReportData('deliveryPerformance'),
            'incidents-by-type' => $this->collectReportData('incidentsByType'),
            'audits-by-status' => $this->collectReportData('auditsByStatus'),
            'pending-proofs' => $this->collectReportData('pendingProofs'),
            'freight-by-transporter' => $this->collectReportData('freightByTransporter'),
            'freight-by-route' => $this->collectReportData('freightByRoute'),
            'freight-by-client' => $this->collectReportData('freightByClient'),
            'freight-divergence-by-period' => $this->collectReportData('freightDivergenceByPeriod'),
            'top-incident-carriers' => $this->collectReportData('topIncidentCarriers'),
            'best-performance-carriers' => $this->collectReportData('bestPerformanceCarriers'),
            'average-delivery-time' => $this->collectReportData('averageDeliveryTime'),
            'sla-ranking-by-transporter' => $this->collectReportData('slaRankingByTransporter'),
        };

        $payload = is_array($reportData) && array_key_exists('data', $reportData) ? $reportData['data'] : $reportData;
        $columns = $payload['columns'] ?? [];
        $items = $payload['items'] ?? [];

        $lines = [implode(';', array_map(static fn (array $column) => $column['label'], $columns))];

        foreach ($items as $item) {
            $lines[] = implode(';', array_map(static function (array $column) use ($item) {
                $value = $item[$column['key']] ?? '';
                $value = is_scalar($value) ? (string) $value : '';
                return '"' . str_replace('"', '""', $value) . '"';
            }, $columns));
        }

        return $this->response
            ->setStatusCode(200)
            ->setHeader('Content-Type', 'text/csv; charset=utf-8')
            ->setHeader('Content-Disposition', 'attachment; filename="' . $reportKey . '-' . Time::now()->format('Ymd-His') . '.csv"')
            ->setBody(implode(PHP_EOL, $lines));
    }

    private function respondPaginatedReport(string $key, string $title, $builder, array $columns, array $filters)
    {
        $page = $filters['page'];
        $perPage = $filters['per_page'];
        $total = (clone $builder)->countAllResults();
        $items = $builder->limit($perPage, ($page - 1) * $perPage)->get()->getResultArray();

        return $this->respondReport($key, $title, $items, $columns, $filters, true, $total);
    }

    private function respondReport(
        string $key,
        string $title,
        array $items,
        array $columns,
        array $filters,
        bool $paginated = false,
        int $total = 0,
        ?array $chart = null
    ) {
        $meta = $paginated
            ? [
                'page' => $filters['page'],
                'perPage' => $filters['per_page'],
                'total' => $total,
                'pageCount' => (int) ceil($total / max(1, $filters['per_page'])),
              ]
            : null;

        return $this->respondSuccess([
            'report' => [
                'key' => $key,
                'title' => $title,
            ],
            'columns' => $columns,
            'items' => $items,
            'chart' => $chart,
            'meta' => $meta,
            'filters' => [
                'start_date' => $filters['start_date'],
                'end_date' => $filters['end_date'],
                'company_id' => $filters['company_id'],
                'transporter_id' => $filters['transporter_id'] ?: null,
                'status' => $filters['status'],
            ],
        ], 'Relatorio carregado com sucesso.');
    }

    private function resolveFilters(): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $requestedCompanyId = (int) ($this->request->getGet('company_id') ?? 0);

        return [
            'company_id' => $requestedCompanyId > 0 ? $requestedCompanyId : $companyId,
            'transporter_id' => (int) ($this->request->getGet('transporter_id') ?? 0),
            'status' => trim((string) ($this->request->getGet('status') ?? '')),
            'start_date' => trim((string) ($this->request->getGet('start_date') ?? '')) ?: Time::now()->startOfMonth()->toDateString(),
            'end_date' => trim((string) ($this->request->getGet('end_date') ?? '')) ?: Time::now()->toDateString(),
            'page' => max(1, (int) ($this->request->getGet('page') ?? 1)),
            'per_page' => min(100, max(5, (int) ($this->request->getGet('perPage') ?? 10))),
        ];
    }

    private function collectReportData(string $method): array
    {
        $response = $this->{$method}();
        $payload = json_decode((string) $response->getBody(), true);

        return $payload ?? [];
    }

    private function buildCarrierPerformanceRows(array $filters): array
    {
        $rows = $this->db->table('delivery_receipts')
            ->select("carriers.razao_social as transportadora, COUNT(*) as entregas_total, SUM(CASE WHEN DATE(delivery_receipts.data_entrega_real) <= transport_documents.data_entrega_prevista THEN 1 ELSE 0 END) as entregas_no_prazo, AVG(TIMESTAMPDIFF(HOUR, transport_documents.data_coleta_prevista, delivery_receipts.data_entrega_real) / 24) as tempo_medio_dias", false)
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('delivery_receipts.company_id', $filters['company_id'])
            ->where('delivery_receipts.deleted_at', null)
            ->where('DATE(delivery_receipts.data_entrega_real) >=', $filters['start_date'])
            ->where('DATE(delivery_receipts.data_entrega_real) <=', $filters['end_date'])
            ->groupBy('carriers.razao_social');

        if ($filters['transporter_id'] > 0) {
            $rows->where('transport_documents.transporter_id', $filters['transporter_id']);
        }

        $rows = $rows->get()->getResultArray();

        return array_map(static function (array $row): array {
            $deliveries = (int) ($row['entregas_total'] ?? 0);
            $onTime = (int) ($row['entregas_no_prazo'] ?? 0);
            $sla = $deliveries > 0 ? round(($onTime / $deliveries) * 100, 2) : 0;

            return [
                ...$row,
                'entregas_total' => $deliveries,
                'entregas_no_prazo' => $onTime,
                'tempo_medio_dias' => round((float) ($row['tempo_medio_dias'] ?? 0), 2),
                'sla_percentual' => $sla,
            ];
        }, $rows);
    }
}
