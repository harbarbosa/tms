<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTransportOrdersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'unsigned' => true],
            'numero_pedido' => ['type' => 'VARCHAR', 'constraint' => 30],
            'cliente_nome' => ['type' => 'VARCHAR', 'constraint' => 180],
            'documento_cliente' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'cep_entrega' => ['type' => 'VARCHAR', 'constraint' => 12, 'null' => true],
            'endereco_entrega' => ['type' => 'VARCHAR', 'constraint' => 180],
            'numero_entrega' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'bairro_entrega' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true],
            'cidade_entrega' => ['type' => 'VARCHAR', 'constraint' => 120],
            'estado_entrega' => ['type' => 'CHAR', 'constraint' => 2],
            'data_prevista_entrega' => ['type' => 'DATE'],
            'peso_total' => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'volume_total' => ['type' => 'DECIMAL', 'constraint' => '12,2', 'null' => true],
            'valor_mercadoria' => ['type' => 'DECIMAL', 'constraint' => '14,2', 'null' => true],
            'observacoes' => ['type' => 'TEXT', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'pendente'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['company_id', 'status']);
        $this->forge->addKey(['company_id', 'data_prevista_entrega']);
        $this->forge->addUniqueKey(['company_id', 'numero_pedido']);
        $this->forge->addForeignKey('company_id', 'companies', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('transport_orders');
    }

    public function down()
    {
        $this->forge->dropTable('transport_orders');
    }
}
