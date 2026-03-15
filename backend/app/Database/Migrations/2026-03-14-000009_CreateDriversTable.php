<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDriversTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'transporter_id' => ['type' => 'INT', 'unsigned' => true],
            'nome' => ['type' => 'VARCHAR', 'constraint' => 180],
            'cpf' => ['type' => 'VARCHAR', 'constraint' => 14],
            'cnh' => ['type' => 'VARCHAR', 'constraint' => 30],
            'categoria_cnh' => ['type' => 'VARCHAR', 'constraint' => 10],
            'validade_cnh' => ['type' => 'DATE'],
            'telefone' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'email' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'active'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'transporter_id']);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addUniqueKey(['company_id', 'cpf']);
        $this->forge->addUniqueKey(['company_id', 'cnh']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('drivers');
    }

    public function down()
    {
        $this->forge->dropTable('drivers');
    }
}
