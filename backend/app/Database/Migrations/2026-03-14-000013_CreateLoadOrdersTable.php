<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLoadOrdersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'load_id' => ['type' => 'INT', 'unsigned' => true],
            'transport_order_id' => ['type' => 'INT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['load_id', 'transport_order_id']);
        $this->forge->addForeignKey('load_id', 'loads', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transport_order_id', 'transport_orders', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('load_orders');
    }

    public function down()
    {
        $this->forge->dropTable('load_orders');
    }
}
