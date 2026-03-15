<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateIncidentsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'transport_document_id' => ['type' => 'INT', 'unsigned' => true],
            'tipo_ocorrencia' => ['type' => 'VARCHAR', 'constraint' => 40],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'aberta'],
            'occurred_at' => ['type' => 'DATETIME'],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'attachment_path' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addKey(['transport_document_id', 'occurred_at']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transport_document_id', 'transport_documents', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('incidents');
    }

    public function down()
    {
        $this->forge->dropTable('incidents');
    }
}
