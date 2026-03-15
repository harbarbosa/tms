<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFreightQuoteProposalsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'cotacao_id' => ['type' => 'INT', 'unsigned' => true],
            'transporter_id' => ['type' => 'INT', 'unsigned' => true],
            'valor_frete' => ['type' => 'DECIMAL', 'constraint' => '14,2', 'null' => true],
            'prazo_entrega_dias' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'status_resposta' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'pendente'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['cotacao_id', 'transporter_id']);
        $this->forge->addForeignKey('cotacao_id', 'freight_quotations', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('transporter_id', 'carriers', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('freight_quote_proposals');
    }

    public function down()
    {
        $this->forge->dropTable('freight_quote_proposals');
    }
}
