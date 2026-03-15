<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTripDocumentsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'ordem_transporte_id' => ['type' => 'INT', 'unsigned' => true],
            'tipo_documento' => ['type' => 'VARCHAR', 'constraint' => 40],
            'numero_documento' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'arquivo' => ['type' => 'VARCHAR', 'constraint' => 255],
            'nome_arquivo_original' => ['type' => 'VARCHAR', 'constraint' => 255],
            'mime_type' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'tamanho_arquivo' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'enviado_por' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'tipo_documento']);
        $this->forge->addKey(['ordem_transporte_id', 'created_at']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('ordem_transporte_id', 'transport_documents', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('trip_documents');
    }

    public function down()
    {
        $this->forge->dropTable('trip_documents');
    }
}
