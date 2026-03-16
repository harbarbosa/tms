<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class TmsSeeder extends Seeder
{
    public function run()
    {
        $this->call(RoleSeeder::class);
        $this->call(PermissionSeeder::class);

        $companyData = [
            'uuid' => $this->generateUuid(),
            'name' => 'Empresa Exemplo',
            'slug' => 'empresa-exemplo',
            'legal_name' => 'Empresa Exemplo Logistica Ltda',
            'tax_id' => '12.345.678/0001-99',
            'razao_social' => 'Empresa Exemplo Logistica Ltda',
            'nome_fantasia' => 'Empresa Exemplo',
            'cnpj' => '12.345.678/0001-99',
            'email' => 'contato@empresaexemplo.com.br',
            'telefone' => '(11) 3000-1000',
            'cep' => '04567-000',
            'endereco' => 'Avenida das Operacoes',
            'numero' => '1000',
            'complemento' => '12 andar',
            'bairro' => 'Vila Olimpia',
            'cidade' => 'Sao Paulo',
            'estado' => 'SP',
            'status' => 'active',
            'tipo_empresa' => 'embarcador',
            'limite_usuarios' => 50,
            'limite_transportadoras' => 100,
            'limite_veiculos' => 300,
            'limite_motoristas' => 300,
            'settings' => json_encode(['timezone' => 'America/Sao_Paulo']),
        ];

        $this->db->table('companies')->ignore(true)->insert($companyData);
        $companyId = (int) $this->db->table('companies')->where('slug', 'empresa-exemplo')->get()->getRow('id');

        $userData = [
            'uuid' => $this->generateUuid(),
            'name' => 'Administrador Master',
            'email' => 'admin@tms.local',
            'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
            'status' => 'active',
        ];

        $this->db->table('users')->ignore(true)->insert($userData);
        $userId = (int) $this->db->table('users')->where('email', 'admin@tms.local')->get()->getRow('id');
        $roleId = (int) $this->db->table('roles')->where('slug', 'master_admin')->get()->getRow('id');

        $this->syncRolePermissions();
        $this->attachUserToCompanyWithRole($userId, $companyId, $roleId);

        $carriers = [
            [
                'company_id' => $companyId,
                'razao_social' => 'Translog Transportes Ltda',
                'nome_fantasia' => 'Translog',
                'cnpj' => '12345678000199',
                'antt' => 'ANTT123456',
                'email' => 'operacao@translog.com.br',
                'telefone' => '(11) 4000-1000',
                'cep' => '01001-000',
                'endereco' => 'Rua das Transportadoras',
                'numero' => '100',
                'complemento' => 'Galpao A',
                'bairro' => 'Centro',
                'cidade' => 'Sao Paulo',
                'estado' => 'SP',
                'status' => 'active',
            ],
            [
                'company_id' => $companyId,
                'razao_social' => 'Rota Sul Logistica SA',
                'nome_fantasia' => 'Rota Sul',
                'cnpj' => '98765432000188',
                'antt' => 'ANTT654321',
                'email' => 'contato@rotasul.com.br',
                'telefone' => '(41) 3333-2222',
                'cep' => '80010-000',
                'endereco' => 'Avenida das Cargas',
                'numero' => '450',
                'complemento' => null,
                'bairro' => 'Industrial',
                'cidade' => 'Curitiba',
                'estado' => 'PR',
                'status' => 'inactive',
            ],
        ];

        foreach ($carriers as $carrier) {
            $this->db->table('carriers')->ignore(true)->insert($carrier);
        }

        $translogId = (int) $this->db->table('carriers')->where('cnpj', '12345678000199')->get()->getRow('id');
        $rotasulId = (int) $this->db->table('carriers')->where('cnpj', '98765432000188')->get()->getRow('id');

        $drivers = [
            [
                'company_id' => $companyId,
                'transporter_id' => $translogId,
                'nome' => 'Carlos Eduardo Silva',
                'cpf' => '12345678909',
                'cnh' => 'SP123456789',
                'categoria_cnh' => 'E',
                'validade_cnh' => '2027-10-15',
                'telefone' => '(11) 98888-1111',
                'email' => 'carlos.silva@translog.com.br',
                'observacoes' => 'Motorista dedicado para operacoes de longa distancia.',
                'status' => 'active',
            ],
            [
                'company_id' => $companyId,
                'transporter_id' => $rotasulId,
                'nome' => 'Marcos Vinicius Souza',
                'cpf' => '11144477735',
                'cnh' => 'PR987654321',
                'categoria_cnh' => 'D',
                'validade_cnh' => '2026-12-20',
                'telefone' => '(41) 97777-2222',
                'email' => 'marcos.souza@rotasul.com.br',
                'observacoes' => null,
                'status' => 'inactive',
            ],
        ];

        foreach ($drivers as $driver) {
            $this->db->table('drivers')->ignore(true)->insert($driver);
        }

        $vehicles = [
            [
                'company_id' => $companyId,
                'transporter_id' => $translogId,
                'placa' => 'BRA2E19',
                'renavam' => '12345678901',
                'tipo_veiculo' => 'CAVALO',
                'tipo_carroceria' => 'BAU',
                'capacidade_peso' => 28000.00,
                'capacidade_volume' => 90.00,
                'ano_modelo' => 2022,
                'status' => 'active',
                'observacoes' => 'Veiculo dedicado para operacoes fracionadas.',
            ],
            [
                'company_id' => $companyId,
                'transporter_id' => $rotasulId,
                'placa' => 'ABC1234',
                'renavam' => '10987654321',
                'tipo_veiculo' => 'TRUCK',
                'tipo_carroceria' => 'SIDER',
                'capacidade_peso' => 14000.00,
                'capacidade_volume' => 55.00,
                'ano_modelo' => 2019,
                'status' => 'inactive',
                'observacoes' => null,
            ],
        ];

        foreach ($vehicles as $vehicle) {
            $this->db->table('vehicles')->ignore(true)->insert($vehicle);
        }

        $orders = [
            [
                'company_id' => $companyId,
                'numero_pedido' => 'PED-' . $companyId . '-20260314-0001',
                'cliente_nome' => 'Cliente Exemplo A',
                'documento_cliente' => '12345678000111',
                'cep_entrega' => '04567-000',
                'endereco_entrega' => 'Avenida das Entregas',
                'numero_entrega' => '250',
                'bairro_entrega' => 'Itaim',
                'cidade_entrega' => 'Sao Paulo',
                'estado_entrega' => 'SP',
                'data_prevista_entrega' => '2026-03-20',
                'peso_total' => 1250.50,
                'volume_total' => 12.75,
                'valor_mercadoria' => 45890.30,
                'observacoes' => 'Pedido prioritario para composicao de carga dedicada.',
                'status' => 'pendente',
            ],
            [
                'company_id' => $companyId,
                'numero_pedido' => 'PED-' . $companyId . '-20260314-0002',
                'cliente_nome' => 'Cliente Exemplo B',
                'documento_cliente' => '98765432000122',
                'cep_entrega' => '80010-000',
                'endereco_entrega' => 'Rua da Operacao',
                'numero_entrega' => '99',
                'bairro_entrega' => 'Centro',
                'cidade_entrega' => 'Curitiba',
                'estado_entrega' => 'PR',
                'data_prevista_entrega' => '2026-03-22',
                'peso_total' => 8200.00,
                'volume_total' => 31.20,
                'valor_mercadoria' => 128500.00,
                'observacoes' => 'Pedido previsto para fluxo de cotacao e contratacao.',
                'status' => 'cotacao',
            ],
        ];

        foreach ($orders as $order) {
            $this->db->table('transport_orders')->ignore(true)->insert($order);
        }

        $firstOrderId = (int) $this->db->table('transport_orders')
            ->where('numero_pedido', 'PED-' . $companyId . '-20260314-0001')
            ->get()
            ->getRow('id');
        $secondOrderId = (int) $this->db->table('transport_orders')
            ->where('numero_pedido', 'PED-' . $companyId . '-20260314-0002')
            ->get()
            ->getRow('id');

        $loadData = [
            'company_id' => $companyId,
            'codigo_carga' => 'CRG-' . $companyId . '-20260314-0001',
            'origem_nome' => 'Centro de Distribuicao Matriz',
            'origem_cidade' => 'Sao Paulo',
            'origem_estado' => 'SP',
            'destino_nome' => 'Hub Regional Sul',
            'destino_cidade' => 'Curitiba',
            'destino_estado' => 'PR',
            'data_prevista_saida' => '2026-03-18',
            'data_prevista_entrega' => '2026-03-22',
            'peso_total' => 9450.50,
            'volume_total' => 43.95,
            'valor_total' => 174390.30,
            'observacoes' => 'Carga piloto para validacao do fluxo de consolidacao de pedidos.',
            'status' => 'em_montagem',
        ];

        $this->db->table('loads')->ignore(true)->insert($loadData);
        $loadId = (int) $this->db->table('loads')
            ->where('codigo_carga', 'CRG-' . $companyId . '-20260314-0001')
            ->get()
            ->getRow('id');

        foreach ([$firstOrderId, $secondOrderId] as $orderId) {
            if ($loadId > 0 && $orderId > 0) {
                $this->db->table('load_orders')->ignore(true)->insert([
                    'load_id' => $loadId,
                    'transport_order_id' => $orderId,
                ]);
            }
        }

        $quotationData = [
            'company_id' => $companyId,
            'tipo_referencia' => 'carga',
            'referencia_id' => $loadId,
            'data_envio' => '2026-03-15',
            'data_limite_resposta' => '2026-03-17',
            'status' => 'em_analise',
            'observacoes' => 'Cotacao piloto para comparacao entre transportadoras homologadas.',
        ];

        $this->db->table('freight_quotations')->ignore(true)->insert($quotationData);
        $quotationId = (int) $this->db->table('freight_quotations')
            ->where('company_id', $companyId)
            ->where('tipo_referencia', 'carga')
            ->where('referencia_id', $loadId)
            ->get()
            ->getRow('id');

        $proposals = [
            [
                'cotacao_id' => $quotationId,
                'transporter_id' => $translogId,
                'valor_frete' => 15400.00,
                'prazo_entrega_dias' => 3,
                'observacoes' => 'Coleta em ate 12 horas apos aprovacao.',
                'status_resposta' => 'respondida',
            ],
            [
                'cotacao_id' => $quotationId,
                'transporter_id' => $rotasulId,
                'valor_frete' => 14950.00,
                'prazo_entrega_dias' => 4,
                'observacoes' => 'Melhor tarifa para consolidacao regional.',
                'status_resposta' => 'pendente',
            ],
        ];

        foreach ($proposals as $proposal) {
            if ($quotationId > 0) {
                $this->db->table('freight_quote_proposals')->ignore(true)->insert($proposal);
            }
        }

        $driverId = (int) $this->db->table('drivers')
            ->where('cpf', '12345678909')
            ->get()
            ->getRow('id');
        $vehicleId = (int) $this->db->table('vehicles')
            ->where('placa', 'BRA2E19')
            ->get()
            ->getRow('id');

        $transportDocumentData = [
            'company_id' => $companyId,
            'numero_ot' => 'OT-' . $companyId . '-20260314-0001',
            'carga_id' => $loadId,
            'pedido_id' => $firstOrderId,
            'transporter_id' => $translogId,
            'driver_id' => $driverId,
            'vehicle_id' => $vehicleId,
            'data_coleta_prevista' => '2026-03-18',
            'data_entrega_prevista' => '2026-03-21',
            'valor_frete_contratado' => 15400.00,
            'status' => 'programada',
            'observacoes' => 'OT piloto criada a partir da aprovacao comercial da cotacao.',
        ];

        $this->db->table('transport_documents')->ignore(true)->insert($transportDocumentData);
        $transportDocumentId = (int) $this->db->table('transport_documents')
            ->where('numero_ot', 'OT-' . $companyId . '-20260314-0001')
            ->get()
            ->getRow('id');

        $trackingEvents = [
            [
                'company_id' => $companyId,
                'transport_document_id' => $transportDocumentId,
                'status' => 'aguardando_coleta',
                'event_at' => '2026-03-17 08:00:00',
                'observacoes' => 'Janela confirmada com a transportadora.',
                'attachment_path' => null,
            ],
            [
                'company_id' => $companyId,
                'transport_document_id' => $transportDocumentId,
                'status' => 'coletado',
                'event_at' => '2026-03-18 09:15:00',
                'observacoes' => 'Carga coletada no CD de origem.',
                'attachment_path' => null,
            ],
            [
                'company_id' => $companyId,
                'transport_document_id' => $transportDocumentId,
                'status' => 'em_transito',
                'event_at' => '2026-03-19 06:40:00',
                'observacoes' => 'Veiculo em rota para o destino final.',
                'attachment_path' => null,
            ],
        ];

        foreach ($trackingEvents as $trackingEvent) {
            if ($transportDocumentId > 0) {
                $this->db->table('tracking_events')->ignore(true)->insert($trackingEvent);
            }
        }

        if ($transportDocumentId > 0) {
            $this->db->table('pickup_schedules')->ignore(true)->insert([
                'company_id' => $companyId,
                'transport_document_id' => $transportDocumentId,
                'transporter_id' => $translogId,
                'unidade_origem' => 'CD Sao Paulo',
                'doca' => 'Doca 05',
                'data_agendada' => '2026-03-18',
                'hora_inicio' => '08:00',
                'hora_fim' => '09:30',
                'janela_atendimento' => '08:00 as 09:30',
                'responsavel_agendamento' => 'Administrador Master',
                'observacoes' => 'Agendamento piloto para expedicao da OT principal.',
                'status' => 'confirmado',
            ]);

            $pickupScheduleId = (int) $this->db->table('pickup_schedules')
                ->where('company_id', $companyId)
                ->where('transport_document_id', $transportDocumentId)
                ->get()
                ->getRow('id');

            $this->db->table('vehicle_checkins')->ignore(true)->insert([
                'company_id' => $companyId,
                'transport_document_id' => $transportDocumentId,
                'pickup_schedule_id' => $pickupScheduleId ?: null,
                'transporter_id' => $translogId,
                'driver_id' => $driverId,
                'vehicle_id' => $vehicleId,
                'placa' => 'BRA2E19',
                'doca' => 'Doca 05',
                'horario_chegada' => '2026-03-18 08:20:00',
                'horario_entrada' => '2026-03-18 08:35:00',
                'horario_saida' => null,
                'status' => 'em_doca',
                'observacoes' => 'Check-in inicial do fluxo piloto.',
                'divergencia' => 0,
            ]);

            $this->db->table('incidents')->ignore(true)->insert([
                'company_id' => $companyId,
                'transport_document_id' => $transportDocumentId,
                'tipo_ocorrencia' => 'atraso',
                'status' => 'em_tratativa',
                'occurred_at' => '2026-03-19 15:20:00',
                'observacoes' => 'Transito intenso no trecho da serra impactando o prazo estimado.',
                'attachment_path' => null,
            ]);

            $this->db->table('freight_audits')->ignore(true)->insert([
                'company_id' => $companyId,
                'ordem_transporte_id' => $transportDocumentId,
                'valor_contratado' => 15400.00,
                'valor_cte' => 15650.00,
                'valor_cobrado' => 15650.00,
                'diferenca_valor' => 250.00,
                'status_auditoria' => 'divergente',
                'observacoes' => 'Cobranca acima do contratado, aguardando tratativa com a transportadora.',
                'auditado_por' => 'Administrador Master',
                'data_auditoria' => '2026-03-22 10:30:00',
            ]);

            $freightAuditId = (int) $this->db->table('freight_audits')
                ->where('company_id', $companyId)
                ->where('ordem_transporte_id', $transportDocumentId)
                ->get()
                ->getRow('id');

            if ($freightAuditId > 0) {
                $this->db->table('freight_financial_entries')->ignore(true)->insert([
                    'company_id' => $companyId,
                    'transport_document_id' => $transportDocumentId,
                    'freight_audit_id' => $freightAuditId,
                    'transporter_id' => $translogId,
                    'valor_previsto' => 15650.00,
                    'valor_aprovado' => null,
                    'valor_pago' => null,
                    'data_prevista_pagamento' => '2026-03-28',
                    'data_pagamento' => null,
                    'forma_pagamento' => 'pix',
                    'status' => 'bloqueado',
                    'motivo_bloqueio' => 'Bloqueado automaticamente por divergencia na auditoria.',
                    'observacoes' => 'Lancamento financeiro piloto vinculado a auditoria divergente.',
                    'criado_por' => 'Administrador Master',
                    'atualizado_por' => 'Administrador Master',
                ]);

                $financialEntryId = (int) $this->db->table('freight_financial_entries')
                    ->where('company_id', $companyId)
                    ->where('freight_audit_id', $freightAuditId)
                    ->get()
                    ->getRow('id');

                if ($financialEntryId > 0) {
                    $this->db->table('freight_financial_histories')->ignore(true)->insert([
                        'company_id' => $companyId,
                        'freight_financial_entry_id' => $financialEntryId,
                        'evento' => 'criado',
                        'status_anterior' => null,
                        'status_novo' => 'bloqueado',
                        'motivo' => 'Lancamento criado a partir da auditoria de frete.',
                        'payload_json' => json_encode(['origem' => 'auditoria'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        'responsavel' => 'Administrador Master',
                    ]);

                    $this->db->table('freight_financial_histories')->ignore(true)->insert([
                        'company_id' => $companyId,
                        'freight_financial_entry_id' => $financialEntryId,
                        'evento' => 'bloqueado',
                        'status_anterior' => 'pendente',
                        'status_novo' => 'bloqueado',
                        'motivo' => 'Bloqueado automaticamente por divergencia na auditoria.',
                        'payload_json' => json_encode(['diferenca_valor' => 250.00], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        'responsavel' => 'Administrador Master',
                    ]);
                }
            }
        }

        $financeUserId = $this->upsertUser([
            'uuid' => $this->generateUuid(),
            'name' => 'Usuario Financeiro',
            'email' => 'financeiro@tms.local',
            'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
            'status' => 'active',
        ], 'financeiro@tms.local');
        $this->attachUserToCompanyWithRole(
            $financeUserId,
            $companyId,
            (int) $this->db->table('roles')->where('slug', 'financial')->get()->getRow('id')
        );

        $carrierUserId = $this->upsertUser([
            'uuid' => $this->generateUuid(),
            'name' => 'Portal Transportadora',
            'email' => 'transportadora@tms.local',
            'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
            'carrier_id' => $translogId,
            'status' => 'active',
        ], 'transportadora@tms.local');
        $this->attachUserToCompanyWithRole(
            $carrierUserId,
            $companyId,
            (int) $this->db->table('roles')->where('slug', 'carrier')->get()->getRow('id')
        );

        $driverUserId = $this->upsertUser([
            'uuid' => $this->generateUuid(),
            'name' => 'Portal Motorista',
            'email' => 'motorista@tms.local',
            'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
            'driver_id' => $driverId,
            'carrier_id' => $translogId,
            'status' => 'active',
        ], 'motorista@tms.local');
        $this->attachUserToCompanyWithRole(
            $driverUserId,
            $companyId,
            (int) $this->db->table('roles')->where('slug', 'driver')->get()->getRow('id')
        );
    }

    private function syncRolePermissions(): void
    {
        $permissionIdsBySlug = [];

        foreach ($this->db->table('permissions')->get()->getResultArray() as $permission) {
            $permissionIdsBySlug[$permission['slug']] = (int) $permission['id'];
        }

        $roleIdsBySlug = [];

        foreach ($this->db->table('roles')->get()->getResultArray() as $role) {
            $roleIdsBySlug[$role['slug']] = (int) $role['id'];
        }

        $rolePermissions = [
            'master_admin' => array_keys($permissionIdsBySlug),
            'logistics_manager' => [
                'dashboard.view',
                'carriers.view', 'carriers.create', 'carriers.update', 'carriers.delete',
                'drivers.view', 'drivers.create', 'drivers.update', 'drivers.delete',
                'vehicles.view', 'vehicles.create', 'vehicles.update', 'vehicles.delete',
                'transport_orders.view', 'transport_orders.create', 'transport_orders.update', 'transport_orders.delete',
                'loads.view', 'loads.create', 'loads.update', 'loads.delete',
                'freight_quotations.view', 'freight_quotations.create', 'freight_quotations.update', 'freight_quotations.delete', 'freight_quotations.approve',
                'freight_hirings.view', 'freight_hirings.create', 'freight_hirings.update',
                'transport_documents.view', 'transport_documents.create', 'transport_documents.update', 'transport_documents.delete',
                'pickup_schedules.view', 'pickup_schedules.create', 'pickup_schedules.update',
                'vehicle_checkins.view', 'vehicle_checkins.create', 'vehicle_checkins.update',
                'delivery_tracking.view', 'delivery_tracking.update',
                'incidents.view', 'incidents.create', 'incidents.update', 'incidents.delete',
                'trip_documents.view', 'trip_documents.create', 'trip_documents.delete',
                'proof_of_deliveries.view', 'proof_of_deliveries.create', 'proof_of_deliveries.update',
                'freight_audits.view',
                'reports.view',
            ],
            'logistics_operator' => [
                'dashboard.view',
                'carriers.view',
                'drivers.view',
                'vehicles.view',
                'transport_orders.view', 'transport_orders.create', 'transport_orders.update',
                'loads.view', 'loads.create', 'loads.update',
                'freight_quotations.view', 'freight_quotations.create', 'freight_quotations.update',
                'freight_hirings.view', 'freight_hirings.create', 'freight_hirings.update',
                'transport_documents.view', 'transport_documents.create', 'transport_documents.update',
                'pickup_schedules.view', 'pickup_schedules.create', 'pickup_schedules.update',
                'vehicle_checkins.view', 'vehicle_checkins.create', 'vehicle_checkins.update',
                'delivery_tracking.view', 'delivery_tracking.update',
                'incidents.view', 'incidents.create', 'incidents.update',
                'trip_documents.view', 'trip_documents.create',
                'proof_of_deliveries.view', 'proof_of_deliveries.create', 'proof_of_deliveries.update',
            ],
            'financial' => [
                'dashboard.view',
                'transport_documents.view',
                'trip_documents.view',
                'proof_of_deliveries.view',
                'freight_audits.view', 'freight_audits.create', 'freight_audits.update',
                'financial.view', 'financial.create', 'financial.update',
                'reports.view',
            ],
            'carrier' => [
                'dashboard.view',
                'freight_quotations.view', 'freight_quotations.respond',
                'freight_hirings.view',
                'transport_documents.view',
                'delivery_tracking.view', 'delivery_tracking.update',
                'incidents.view', 'incidents.create', 'incidents.update',
                'trip_documents.view', 'trip_documents.create',
                'proof_of_deliveries.view',
            ],
            'driver' => [
                'dashboard.view',
                'transport_documents.view',
                'delivery_tracking.view', 'delivery_tracking.update',
                'incidents.view', 'incidents.create',
                'trip_documents.view',
                'proof_of_deliveries.view', 'proof_of_deliveries.create',
            ],
        ];

        foreach ($rolePermissions as $roleSlug => $permissionSlugs) {
            $roleId = $roleIdsBySlug[$roleSlug] ?? null;

            if (! $roleId) {
                continue;
            }

            foreach ($permissionSlugs as $permissionSlug) {
                $permissionId = $permissionIdsBySlug[$permissionSlug] ?? null;

                if (! $permissionId) {
                    continue;
                }

                $this->db->table('role_permissions')->ignore(true)->insert([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }

    private function attachUserToCompanyWithRole(int $userId, int $companyId, int $roleId): void
    {
        $this->db->table('user_companies')->ignore(true)->insert([
            'user_id' => $userId,
            'company_id' => $companyId,
            'is_default' => 1,
            'is_active' => 1,
        ]);

        $this->db->table('user_roles')->ignore(true)->insert([
            'user_id' => $userId,
            'role_id' => $roleId,
            'company_id' => $companyId,
        ]);
    }

    private function upsertUser(array $data, string $email): int
    {
        $this->db->table('users')->ignore(true)->insert($data);

        return (int) $this->db->table('users')->where('email', $email)->get()->getRow('id');
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
