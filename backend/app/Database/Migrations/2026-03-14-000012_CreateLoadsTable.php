<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLoadsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'codigo_carga' => ['type' => 'VARCHAR', 'constraint' => 30],
            'origem_nome' => ['type' => 'VARCHAR', 'constraint' => 180],
            'origem_cidade' => ['type' => 'VARCHAR', 'constraint' => 120],
            'origem_estado' => ['type' => 'CHAR', 'constraint' => 2],
            'destino_nome' => ['type' => 'VARCHAR', 'constraint' => 180],
            'destino_cidade' => ['type' => 'VARCHAR', 'constraint' => 120],
            'destino_estado' => ['type' => 'CHAR', 'constraint' => 2],
            'data_prevista_saida' => ['type' => 'DATE'],
            'data_prevista_entrega' => ['type' => 'DATE'],
            'peso_total' => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'volume_total' => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'valor_total' => ['type' => 'DECIMAL', 'constraint' => '14,2', 'null' => true],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'planejada'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addKey(['company_id', 'data_prevista_saida']);
        $this->forge->addUniqueKey(['company_id', 'codigo_carga']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('loads');
    }

    public function down()
    {
        $this->forge->dropTable('loads');
    }
}
