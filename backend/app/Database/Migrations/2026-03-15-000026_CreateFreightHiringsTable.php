<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFreightHiringsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'freight_quotation_id' => ['type' => 'INT', 'unsigned' => true],
            'freight_quotation_proposal_id' => ['type' => 'INT', 'unsigned' => true],
            'transport_document_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'tipo_referencia' => ['type' => 'VARCHAR', 'constraint' => 20],
            'referencia_id' => ['type' => 'INT', 'unsigned' => true],
            'transporter_id' => ['type' => 'INT', 'unsigned' => true],
            'valor_contratado' => ['type' => 'DECIMAL', 'constraint' => '15,2', 'null' => true],
            'prazo_entrega_dias' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'condicoes_comerciais' => ['type' => 'TEXT', 'null' => true],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'pendente'],
            'contratado_por' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'data_contratacao' => ['type' => 'DATETIME', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey('company_id');
        $this->forge->addKey('freight_quotation_id');
        $this->forge->addKey('freight_quotation_proposal_id');
        $this->forge->addKey('transporter_id');
        $this->forge->addKey('status');
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('freight_quotation_id', 'freight_quotations', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('freight_quotation_proposal_id', 'freight_quote_proposals', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transport_document_id', 'transport_documents', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('freight_hirings');
    }

    public function down()
    {
        $this->forge->dropTable('freight_hirings');
    }
}
