<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddFreightHiringIdToTransportDocumentsTable extends Migration
{
    public function up()
    {
        $this->forge->addColumn('transport_documents', [
            'freight_hiring_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
                'after' => 'pedido_id',
            ],
        ]);

        $this->forge->addKey('freight_hiring_id');
        $this->forge->addUniqueKey('freight_hiring_id');
        $this->forge->addForeignKey('freight_hiring_id', 'freight_hirings', 'id', 'SET NULL', 'CASCADE');
    }

    public function down()
    {
        $this->forge->dropForeignKey('transport_documents', 'transport_documents_freight_hiring_id_foreign');
        $this->forge->dropColumn('transport_documents', 'freight_hiring_id');
    }
}
