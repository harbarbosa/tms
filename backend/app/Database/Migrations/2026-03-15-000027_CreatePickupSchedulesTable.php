<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePickupSchedulesTable extends Migration
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
            'transporter_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'unidade_origem' => [
                'type' => 'VARCHAR',
                'constraint' => 150,
            ],
            'doca' => [
                'type' => 'VARCHAR',
                'constraint' => 80,
                'null' => true,
            ],
            'data_agendada' => [
                'type' => 'DATE',
            ],
            'hora_inicio' => [
                'type' => 'TIME',
            ],
            'hora_fim' => [
                'type' => 'TIME',
            ],
            'janela_atendimento' => [
                'type' => 'VARCHAR',
                'constraint' => 120,
                'null' => true,
            ],
            'responsavel_agendamento' => [
                'type' => 'VARCHAR',
                'constraint' => 150,
                'null' => true,
            ],
            'observacoes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 30,
                'default' => 'agendado',
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
        $this->forge->addKey('transporter_id');
        $this->forge->addKey('data_agendada');
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transport_document_id', 'transport_documents', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('pickup_schedules');
    }

    public function down()
    {
        $this->forge->dropTable('pickup_schedules', true);
    }
}
