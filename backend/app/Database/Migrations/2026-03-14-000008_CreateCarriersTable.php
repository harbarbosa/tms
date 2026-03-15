<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCarriersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'razao_social' => ['type' => 'VARCHAR', 'constraint' => 180],
            'nome_fantasia' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'cnpj' => ['type' => 'VARCHAR', 'constraint' => 18, 'null' => true],
            'antt' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'email' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'telefone' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'cep' => ['type' => 'VARCHAR', 'constraint' => 12, 'null' => true],
            'endereco' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'numero' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'complemento' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'bairro' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'cidade' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'estado' => ['type' => 'CHAR', 'constraint' => 2, 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'active'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'razao_social']);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addUniqueKey(['company_id', 'cnpj']);
        $this->forge->addUniqueKey(['company_id', 'antt']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('carriers');
    }

    public function down()
    {
        $this->forge->dropTable('carriers');
    }
}
