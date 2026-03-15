<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFreightAuditsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'ordem_transporte_id' => ['type' => 'INT', 'unsigned' => true],
            'valor_contratado' => ['type' => 'DECIMAL', 'constraint' => '14,2'],
            'valor_cte' => ['type' => 'DECIMAL', 'constraint' => '14,2', 'null' => true],
            'valor_cobrado' => ['type' => 'DECIMAL', 'constraint' => '14,2'],
            'diferenca_valor' => ['type' => 'DECIMAL', 'constraint' => '14,2', 'default' => 0],
            'status_auditoria' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'pendente'],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'auditado_por' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'data_auditoria' => ['type' => 'DATETIME'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['company_id', 'ordem_transporte_id']);
        $this->forge->addKey(['company_id', 'status_auditoria']);
        $this->forge->addKey(['company_id', 'data_auditoria']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('ordem_transporte_id', 'transport_documents', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('freight_audits');
    }

    public function down()
    {
        $this->forge->dropTable('freight_audits');
    }
}
