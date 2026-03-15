<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'Administrador master', 'slug' => 'master_admin', 'description' => 'Acesso total ao sistema.', 'is_system' => 1],
            ['name' => 'Gestor logístico', 'slug' => 'logistics_manager', 'description' => 'Gestao operacional e tatica.', 'is_system' => 1],
            ['name' => 'Operador logístico', 'slug' => 'logistics_operator', 'description' => 'Operacao do dia a dia.', 'is_system' => 1],
            ['name' => 'Financeiro', 'slug' => 'financial', 'description' => 'Gestao financeira de fretes.', 'is_system' => 1],
            ['name' => 'Transportadora', 'slug' => 'carrier', 'description' => 'Portal do parceiro transportador.', 'is_system' => 1],
            ['name' => 'Motorista', 'slug' => 'driver', 'description' => 'Acesso operacional do motorista.', 'is_system' => 1],
        ];

        foreach ($roles as $role) {
            $this->db->table('roles')->ignore(true)->insert($role);
        }
    }
}
