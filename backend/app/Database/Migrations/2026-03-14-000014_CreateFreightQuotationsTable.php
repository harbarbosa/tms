<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFreightQuotationsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'tipo_referencia' => ['type' => 'VARCHAR', 'constraint' => 20],
            'referencia_id' => ['type' => 'INT', 'unsigned' => true],
            'data_envio' => ['type' => 'DATE'],
            'data_limite_resposta' => ['type' => 'DATE'],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'rascunho'],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addKey(['company_id', 'tipo_referencia', 'referencia_id']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('freight_quotations');
    }

    public function down()
    {
        $this->forge->dropTable('freight_quotations');
    }
}
