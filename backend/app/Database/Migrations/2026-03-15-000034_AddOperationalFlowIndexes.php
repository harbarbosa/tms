<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddOperationalFlowIndexes extends Migration
{
    public function up()
    {
        $this->db->query('CREATE INDEX idx_transport_documents_company_transporter_status ON transport_documents (company_id, transporter_id, status)');
        $this->db->query('CREATE INDEX idx_pickup_schedules_company_date_status ON pickup_schedules (company_id, data_agendada, status)');
        $this->db->query('CREATE INDEX idx_vehicle_checkins_company_status_arrival ON vehicle_checkins (company_id, status, horario_chegada)');
        $this->db->query('CREATE INDEX idx_freight_financial_entries_company_status_due ON freight_financial_entries (company_id, status, data_prevista_pagamento)');
        $this->db->query('CREATE INDEX idx_incidents_company_type_status ON incidents (company_id, tipo_ocorrencia, status)');
    }

    public function down()
    {
        $this->db->query('DROP INDEX idx_transport_documents_company_transporter_status ON transport_documents');
        $this->db->query('DROP INDEX idx_pickup_schedules_company_date_status ON pickup_schedules');
        $this->db->query('DROP INDEX idx_vehicle_checkins_company_status_arrival ON vehicle_checkins');
        $this->db->query('DROP INDEX idx_freight_financial_entries_company_status_due ON freight_financial_entries');
        $this->db->query('DROP INDEX idx_incidents_company_type_status ON incidents');
    }
}
