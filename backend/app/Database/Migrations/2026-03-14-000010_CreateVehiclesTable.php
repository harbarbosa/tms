<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateVehiclesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'transporter_id' => ['type' => 'INT', 'unsigned' => true],
            'placa' => ['type' => 'VARCHAR', 'constraint' => 10],
            'renavam' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'tipo_veiculo' => ['type' => 'VARCHAR', 'constraint' => 80],
            'tipo_carroceria' => ['type' => 'VARCHAR', 'constraint' => 80, 'null' => true],
            'capacidade_peso' => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'capacidade_volume' => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'ano_modelo' => ['type' => 'INT', 'constraint' => 4, 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'active'],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'transporter_id']);
        $this->forge->addKey(['company_id', 'tipo_veiculo']);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addUniqueKey(['company_id', 'placa']);
        $this->forge->addUniqueKey(['company_id', 'renavam']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('vehicles');
    }

    public function down()
    {
        $this->forge->dropTable('vehicles');
    }
}
