<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPhoneToUsersTable extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'telefone' => [
                'type' => 'VARCHAR',
                'constraint' => 30,
                'null' => true,
                'after' => 'email',
            ],
        ]);

        $this->db->query('CREATE INDEX users_status_index ON users (status)');
    }

    public function down()
    {
        $this->db->query('DROP INDEX users_status_index ON users');
        $this->forge->dropColumn('users', 'telefone');
    }
}
