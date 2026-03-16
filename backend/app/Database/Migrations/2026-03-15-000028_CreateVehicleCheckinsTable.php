<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateVehicleCheckinsTable extends Migration
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
                'null' => true,
            ],
            'pickup_schedule_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => true,
            ],
            'transporter_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'driver_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => true,
            ],
            'vehicle_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => true,
            ],
            'placa' => [
                'type' => 'VARCHAR',
                'constraint' => 10,
                'null' => true,
            ],
            'doca' => [
                'type' => 'VARCHAR',
                'constraint' => 80,
                'null' => true,
            ],
            'horario_chegada' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'horario_entrada' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'horario_saida' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 30,
                'default' => 'aguardando',
            ],
            'observacoes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'divergencia' => [
                'type' => 'TINYINT',
                'constraint' => 1,
                'default' => 0,
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
        $this->forge->addKey('company_id');
        $this->forge->addKey('transport_document_id');
        $this->forge->addKey('pickup_schedule_id');
        $this->forge->addKey('transporter_id');
        $this->forge->addKey('driver_id');
        $this->forge->addKey('vehicle_id');
        $this->forge->addKey('status');
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transport_document_id', 'transport_documents', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('pickup_schedule_id', 'pickup_schedules', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('driver_id', 'drivers', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('vehicle_id', 'vehicles', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('vehicle_checkins');
    }

    public function down()
    {
        $this->forge->dropTable('vehicle_checkins', true);
    }
}
