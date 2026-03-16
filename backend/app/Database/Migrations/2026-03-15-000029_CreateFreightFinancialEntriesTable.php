<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFreightFinancialEntriesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'company_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'transport_document_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'freight_audit_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'transporter_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'valor_previsto' => [
                'type' => 'DECIMAL',
                'constraint' => '15,2',
                'default' => 0,
            ],
            'valor_aprovado' => [
                'type' => 'DECIMAL',
                'constraint' => '15,2',
                'null' => true,
            ],
            'valor_pago' => [
                'type' => 'DECIMAL',
                'constraint' => '15,2',
                'null' => true,
            ],
            'data_prevista_pagamento' => [
                'type' => 'DATE',
                'null' => true,
            ],
            'data_pagamento' => [
                'type' => 'DATE',
                'null' => true,
            ],
            'forma_pagamento' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 30,
                'default' => 'pendente',
            ],
            'motivo_bloqueio' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'observacoes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'criado_por' => [
                'type' => 'VARCHAR',
                'constraint' => 150,
                'null' => true,
            ],
            'atualizado_por' => [
                'type' => 'VARCHAR',
                'constraint' => 150,
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('freight_audit_id');
        $this->forge->addKey('company_id');
        $this->forge->addKey('transport_document_id');
        $this->forge->addKey('transporter_id');
        $this->forge->addKey('status');
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transport_document_id', 'transport_documents', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('freight_audit_id', 'freight_audits', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('freight_financial_entries');
    }

    public function down()
    {
        $this->forge->dropTable('freight_financial_entries', true);
    }
}
