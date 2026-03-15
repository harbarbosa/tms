<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTransportDocumentsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'numero_ot' => ['type' => 'VARCHAR', 'constraint' => 40],
            'carga_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'pedido_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'transporter_id' => ['type' => 'INT', 'unsigned' => true],
            'driver_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'vehicle_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'data_coleta_prevista' => ['type' => 'DATE'],
            'data_entrega_prevista' => ['type' => 'DATE'],
            'valor_frete_contratado' => ['type' => 'DECIMAL', 'constraint' => '14,2', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'rascunho'],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addKey(['company_id', 'data_coleta_prevista']);
        $this->forge->addUniqueKey(['company_id', 'numero_ot']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('carga_id', 'loads', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('pedido_id', 'transport_orders', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('driver_id', 'drivers', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('vehicle_id', 'vehicles', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('transport_documents');
    }

    public function down()
    {
        $this->forge->dropTable('transport_documents');
    }
}
