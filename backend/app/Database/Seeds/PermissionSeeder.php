<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            ['name' => 'Visualizar dashboard', 'slug' => 'dashboard.view', 'module' => 'dashboard', 'description' => 'Acesso ao painel inicial.'],
            ['name' => 'Visualizar empresas', 'slug' => 'companies.view', 'module' => 'companies', 'description' => 'Consultar empresas do tenant.'],
            ['name' => 'Gerenciar empresas', 'slug' => 'companies.manage', 'module' => 'companies', 'description' => 'Criar e editar empresas.'],
            ['name' => 'Visualizar usuarios', 'slug' => 'users.view', 'module' => 'users', 'description' => 'Consultar usuarios e perfis.'],
            ['name' => 'Gerenciar usuarios', 'slug' => 'users.manage', 'module' => 'users', 'description' => 'Criar e editar usuarios.'],
            ['name' => 'Visualizar perfis', 'slug' => 'roles.view', 'module' => 'roles', 'description' => 'Consultar papeis e grupos de acesso.'],
            ['name' => 'Gerenciar perfis', 'slug' => 'roles.manage', 'module' => 'roles', 'description' => 'Criar e editar papeis.'],
            ['name' => 'Visualizar permissoes', 'slug' => 'permissions.view', 'module' => 'permissions', 'description' => 'Consultar permissoes disponiveis.'],
            ['name' => 'Gerenciar permissoes', 'slug' => 'permissions.manage', 'module' => 'permissions', 'description' => 'Administrar permissoes.'],
            ['name' => 'Visualizar transportadoras', 'slug' => 'carriers.view', 'module' => 'carriers', 'description' => 'Consultar transportadoras.'],
            ['name' => 'Criar transportadoras', 'slug' => 'carriers.create', 'module' => 'carriers', 'description' => 'Cadastrar transportadoras.'],
            ['name' => 'Editar transportadoras', 'slug' => 'carriers.update', 'module' => 'carriers', 'description' => 'Editar transportadoras.'],
            ['name' => 'Excluir transportadoras', 'slug' => 'carriers.delete', 'module' => 'carriers', 'description' => 'Excluir transportadoras.'],
            ['name' => 'Visualizar motoristas', 'slug' => 'drivers.view', 'module' => 'drivers', 'description' => 'Consultar motoristas.'],
            ['name' => 'Criar motoristas', 'slug' => 'drivers.create', 'module' => 'drivers', 'description' => 'Cadastrar motoristas.'],
            ['name' => 'Editar motoristas', 'slug' => 'drivers.update', 'module' => 'drivers', 'description' => 'Editar motoristas.'],
            ['name' => 'Excluir motoristas', 'slug' => 'drivers.delete', 'module' => 'drivers', 'description' => 'Excluir motoristas.'],
            ['name' => 'Visualizar veiculos', 'slug' => 'vehicles.view', 'module' => 'vehicles', 'description' => 'Consultar veiculos.'],
            ['name' => 'Criar veiculos', 'slug' => 'vehicles.create', 'module' => 'vehicles', 'description' => 'Cadastrar veiculos.'],
            ['name' => 'Editar veiculos', 'slug' => 'vehicles.update', 'module' => 'vehicles', 'description' => 'Editar veiculos.'],
            ['name' => 'Excluir veiculos', 'slug' => 'vehicles.delete', 'module' => 'vehicles', 'description' => 'Excluir veiculos.'],
            ['name' => 'Visualizar pedidos de transporte', 'slug' => 'transport_orders.view', 'module' => 'transport_orders', 'description' => 'Consultar pedidos de transporte.'],
            ['name' => 'Criar pedidos de transporte', 'slug' => 'transport_orders.create', 'module' => 'transport_orders', 'description' => 'Cadastrar pedidos de transporte.'],
            ['name' => 'Editar pedidos de transporte', 'slug' => 'transport_orders.update', 'module' => 'transport_orders', 'description' => 'Editar pedidos de transporte.'],
            ['name' => 'Excluir pedidos de transporte', 'slug' => 'transport_orders.delete', 'module' => 'transport_orders', 'description' => 'Excluir pedidos de transporte.'],
            ['name' => 'Visualizar cargas', 'slug' => 'loads.view', 'module' => 'loads', 'description' => 'Consultar cargas.'],
            ['name' => 'Criar cargas', 'slug' => 'loads.create', 'module' => 'loads', 'description' => 'Cadastrar cargas.'],
            ['name' => 'Editar cargas', 'slug' => 'loads.update', 'module' => 'loads', 'description' => 'Editar cargas.'],
            ['name' => 'Excluir cargas', 'slug' => 'loads.delete', 'module' => 'loads', 'description' => 'Excluir cargas.'],
            ['name' => 'Visualizar cotacoes', 'slug' => 'freight_quotations.view', 'module' => 'freight_quotations', 'description' => 'Consultar cotacoes de frete.'],
            ['name' => 'Criar cotacoes', 'slug' => 'freight_quotations.create', 'module' => 'freight_quotations', 'description' => 'Criar cotacoes de frete.'],
            ['name' => 'Editar cotacoes', 'slug' => 'freight_quotations.update', 'module' => 'freight_quotations', 'description' => 'Editar cotacoes de frete.'],
            ['name' => 'Excluir cotacoes', 'slug' => 'freight_quotations.delete', 'module' => 'freight_quotations', 'description' => 'Excluir cotacoes de frete.'],
            ['name' => 'Aprovar cotacoes', 'slug' => 'freight_quotations.approve', 'module' => 'freight_quotations', 'description' => 'Aprovar propostas de frete.'],
            ['name' => 'Responder cotacoes', 'slug' => 'freight_quotations.respond', 'module' => 'freight_quotations', 'description' => 'Responder cotacoes como transportadora.'],
            ['name' => 'Visualizar contratacoes de frete', 'slug' => 'freight_hirings.view', 'module' => 'freight_hirings', 'description' => 'Consultar contratacoes de frete.'],
            ['name' => 'Criar contratacoes de frete', 'slug' => 'freight_hirings.create', 'module' => 'freight_hirings', 'description' => 'Registrar contratacoes de frete.'],
            ['name' => 'Editar contratacoes de frete', 'slug' => 'freight_hirings.update', 'module' => 'freight_hirings', 'description' => 'Editar contratacoes de frete.'],
            ['name' => 'Visualizar ordens de transporte', 'slug' => 'transport_documents.view', 'module' => 'transport_documents', 'description' => 'Consultar ordens de transporte.'],
            ['name' => 'Criar ordens de transporte', 'slug' => 'transport_documents.create', 'module' => 'transport_documents', 'description' => 'Cadastrar ordens de transporte.'],
            ['name' => 'Editar ordens de transporte', 'slug' => 'transport_documents.update', 'module' => 'transport_documents', 'description' => 'Editar ordens de transporte.'],
            ['name' => 'Excluir ordens de transporte', 'slug' => 'transport_documents.delete', 'module' => 'transport_documents', 'description' => 'Excluir ordens de transporte.'],
            ['name' => 'Visualizar agendamentos de coleta', 'slug' => 'pickup_schedules.view', 'module' => 'pickup_schedules', 'description' => 'Consultar agendamentos de coleta.'],
            ['name' => 'Criar agendamentos de coleta', 'slug' => 'pickup_schedules.create', 'module' => 'pickup_schedules', 'description' => 'Registrar agendamentos de coleta.'],
            ['name' => 'Editar agendamentos de coleta', 'slug' => 'pickup_schedules.update', 'module' => 'pickup_schedules', 'description' => 'Editar agendamentos de coleta.'],
            ['name' => 'Visualizar check-ins de veiculo', 'slug' => 'vehicle_checkins.view', 'module' => 'vehicle_checkins', 'description' => 'Consultar check-ins de veiculo.'],
            ['name' => 'Criar check-ins de veiculo', 'slug' => 'vehicle_checkins.create', 'module' => 'vehicle_checkins', 'description' => 'Registrar check-ins de veiculo.'],
            ['name' => 'Editar check-ins de veiculo', 'slug' => 'vehicle_checkins.update', 'module' => 'vehicle_checkins', 'description' => 'Atualizar status e horarios do check-in.'],
            ['name' => 'Visualizar rastreamento', 'slug' => 'delivery_tracking.view', 'module' => 'delivery_tracking', 'description' => 'Consultar o rastreamento das viagens.'],
            ['name' => 'Atualizar rastreamento', 'slug' => 'delivery_tracking.update', 'module' => 'delivery_tracking', 'description' => 'Registrar eventos de rastreamento.'],
            ['name' => 'Visualizar ocorrencias', 'slug' => 'incidents.view', 'module' => 'incidents', 'description' => 'Consultar ocorrencias da operacao.'],
            ['name' => 'Criar ocorrencias', 'slug' => 'incidents.create', 'module' => 'incidents', 'description' => 'Registrar ocorrencias.'],
            ['name' => 'Editar ocorrencias', 'slug' => 'incidents.update', 'module' => 'incidents', 'description' => 'Editar ocorrencias.'],
            ['name' => 'Excluir ocorrencias', 'slug' => 'incidents.delete', 'module' => 'incidents', 'description' => 'Excluir ocorrencias.'],
            ['name' => 'Visualizar documentos de viagem', 'slug' => 'trip_documents.view', 'module' => 'trip_documents', 'description' => 'Consultar documentos logísticos.'],
            ['name' => 'Criar documentos de viagem', 'slug' => 'trip_documents.create', 'module' => 'trip_documents', 'description' => 'Enviar documentos de viagem.'],
            ['name' => 'Excluir documentos de viagem', 'slug' => 'trip_documents.delete', 'module' => 'trip_documents', 'description' => 'Excluir documentos de viagem.'],
            ['name' => 'Visualizar comprovantes de entrega', 'slug' => 'proof_of_deliveries.view', 'module' => 'proof_of_deliveries', 'description' => 'Consultar comprovantes de entrega.'],
            ['name' => 'Criar comprovantes de entrega', 'slug' => 'proof_of_deliveries.create', 'module' => 'proof_of_deliveries', 'description' => 'Registrar comprovantes de entrega.'],
            ['name' => 'Editar comprovantes de entrega', 'slug' => 'proof_of_deliveries.update', 'module' => 'proof_of_deliveries', 'description' => 'Atualizar comprovantes de entrega.'],
            ['name' => 'Visualizar auditorias de frete', 'slug' => 'freight_audits.view', 'module' => 'freight_audits', 'description' => 'Consultar auditorias de frete.'],
            ['name' => 'Criar auditorias de frete', 'slug' => 'freight_audits.create', 'module' => 'freight_audits', 'description' => 'Registrar auditorias de frete.'],
            ['name' => 'Editar auditorias de frete', 'slug' => 'freight_audits.update', 'module' => 'freight_audits', 'description' => 'Editar auditorias de frete.'],
            ['name' => 'Visualizar financeiro', 'slug' => 'financial.view', 'module' => 'financial', 'description' => 'Consultar o modulo financeiro.'],
            ['name' => 'Criar lancamentos financeiros', 'slug' => 'financial.create', 'module' => 'financial', 'description' => 'Criar lancamentos financeiros de frete.'],
            ['name' => 'Atualizar lancamentos financeiros', 'slug' => 'financial.update', 'module' => 'financial', 'description' => 'Liberar, bloquear, pagar e cancelar lancamentos financeiros.'],
            ['name' => 'Visualizar relatorios', 'slug' => 'reports.view', 'module' => 'reports', 'description' => 'Consultar relatorios e indicadores.'],
            ['name' => 'Visualizar configuracoes', 'slug' => 'settings.view', 'module' => 'settings', 'description' => 'Consultar configuracoes do sistema.'],
            ['name' => 'Gerenciar configuracoes', 'slug' => 'settings.manage', 'module' => 'settings', 'description' => 'Editar configuracoes do sistema.'],
        ];

        foreach ($permissions as $permission) {
            $this->db->table('permissions')->ignore(true)->insert($permission);
        }
    }
}
