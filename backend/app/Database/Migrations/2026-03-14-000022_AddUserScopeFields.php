<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUserScopeFields extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'carrier_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
                'after' => 'password_hash',
            ],
            'driver_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
                'after' => 'carrier_id',
            ],
        ]);

        $this->db->query('ALTER TABLE `users` ADD CONSTRAINT `users_carrier_id_foreign` FOREIGN KEY (`carrier_id`) REFERENCES `carriers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE');
        $this->db->query('ALTER TABLE `users` ADD CONSTRAINT `users_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE');
    }

    public function down()
    {
        $this->db->query('ALTER TABLE `users` DROP FOREIGN KEY `users_carrier_id_foreign`');
        $this->db->query('ALTER TABLE `users` DROP FOREIGN KEY `users_driver_id_foreign`');
        $this->forge->dropColumn('users', ['carrier_id', 'driver_id']);
    }
}
