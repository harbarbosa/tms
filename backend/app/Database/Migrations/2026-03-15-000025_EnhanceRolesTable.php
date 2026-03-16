<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class EnhanceRolesTable extends Migration
{
    public function up()
    {
        $this->forge->addColumn('roles', [
            'scope' => [
                'type' => 'VARCHAR',
                'constraint' => 30,
                'default' => 'global',
                'after' => 'description',
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'default' => 'active',
                'after' => 'scope',
            ],
        ]);

        $this->db->query('CREATE INDEX roles_status_index ON roles (status)');
        $this->db->query('CREATE INDEX roles_scope_index ON roles (scope)');
    }

    public function down()
    {
        $this->db->query('DROP INDEX roles_status_index ON roles');
        $this->db->query('DROP INDEX roles_scope_index ON roles');
        $this->forge->dropColumn('roles', ['scope', 'status']);
    }
}
