<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFreightFinancialHistoriesTable extends Migration
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
            'freight_financial_entry_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'evento' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'status_anterior' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'status_novo' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'motivo' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'payload_json' => [
                'type' => 'LONGTEXT',
                'null' => true,
            ],
            'responsavel' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
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
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'freight_financial_entry_id']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('freight_financial_entry_id', 'freight_financial_entries', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('freight_financial_histories');
    }

    public function down()
    {
        $this->forge->dropTable('freight_financial_histories', true);
    }
}
