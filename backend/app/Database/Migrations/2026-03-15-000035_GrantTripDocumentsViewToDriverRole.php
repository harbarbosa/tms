<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class GrantTripDocumentsViewToDriverRole extends Migration
{
    public function up()
    {
        $role = $this->db->table('roles')->where('slug', 'driver')->get()->getRowArray();
        $permission = $this->db->table('permissions')->where('slug', 'trip_documents.view')->get()->getRowArray();

        if (! $role || ! $permission) {
            return;
        }

        $exists = $this->db->table('role_permissions')
            ->where('role_id', (int) $role['id'])
            ->where('permission_id', (int) $permission['id'])
            ->countAllResults();

        if ($exists === 0) {
            $this->db->table('role_permissions')->insert([
                'role_id' => (int) $role['id'],
                'permission_id' => (int) $permission['id'],
            ]);
        }
    }

    public function down()
    {
        $role = $this->db->table('roles')->where('slug', 'driver')->get()->getRowArray();
        $permission = $this->db->table('permissions')->where('slug', 'trip_documents.view')->get()->getRowArray();

        if (! $role || ! $permission) {
            return;
        }

        $this->db->table('role_permissions')
            ->where('role_id', (int) $role['id'])
            ->where('permission_id', (int) $permission['id'])
            ->delete();
    }
}
