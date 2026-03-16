<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateSystemCatalogItemsTable extends Migration
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
            'scope' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
            ],
            'company_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => true,
            ],
            'catalog_type' => [
                'type' => 'VARCHAR',
                'constraint' => 80,
            ],
            'code' => [
                'type' => 'VARCHAR',
                'constraint' => 120,
            ],
            'label' => [
                'type' => 'VARCHAR',
                'constraint' => 180,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'sort_order' => [
                'type' => 'INT',
                'constraint' => 11,
                'default' => 0,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'default' => 'active',
            ],
            'metadata_json' => [
                'type' => 'LONGTEXT',
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
        $this->forge->addKey(['scope', 'company_id', 'catalog_type', 'status']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('system_catalog_items');
    }

    public function down()
    {
        $this->forge->dropTable('system_catalog_items', true);
    }
}
