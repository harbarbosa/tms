<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDeliveryReceiptsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'ordem_transporte_id' => ['type' => 'INT', 'unsigned' => true],
            'data_entrega_real' => ['type' => 'DATETIME'],
            'nome_recebedor' => ['type' => 'VARCHAR', 'constraint' => 180],
            'documento_recebedor' => ['type' => 'VARCHAR', 'constraint' => 60, 'null' => true],
            'observacoes_entrega' => ['type' => 'TEXT', 'null' => true],
            'arquivo_comprovante' => ['type' => 'VARCHAR', 'constraint' => 255],
            'nome_arquivo_original' => ['type' => 'VARCHAR', 'constraint' => 255],
            'mime_type' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'tamanho_arquivo' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['company_id', 'ordem_transporte_id']);
        $this->forge->addKey(['ordem_transporte_id', 'created_at']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('ordem_transporte_id', 'transport_documents', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('delivery_receipts');
    }

    public function down()
    {
        $this->forge->dropTable('delivery_receipts');
    }
}
