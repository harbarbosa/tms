<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'Administrador master', 'slug' => 'master_admin', 'description' => 'Acesso total ao sistema.', 'scope' => 'global', 'status' => 'active', 'is_system' => 1],
            ['name' => 'Gestor logistico', 'slug' => 'logistics_manager', 'description' => 'Gestao operacional e tatica.', 'scope' => 'company', 'status' => 'active', 'is_system' => 1],
            ['name' => 'Operador logistico', 'slug' => 'logistics_operator', 'description' => 'Operacao do dia a dia.', 'scope' => 'company', 'status' => 'active', 'is_system' => 1],
            ['name' => 'Financeiro', 'slug' => 'financial', 'description' => 'Gestao financeira de fretes.', 'scope' => 'company', 'status' => 'active', 'is_system' => 1],
            ['name' => 'Transportadora', 'slug' => 'carrier', 'description' => 'Portal do parceiro transportador.', 'scope' => 'carrier', 'status' => 'active', 'is_system' => 1],
            ['name' => 'Motorista', 'slug' => 'driver', 'description' => 'Acesso operacional do motorista.', 'scope' => 'driver', 'status' => 'active', 'is_system' => 1],
        ];

        foreach ($roles as $role) {
            $this->db->table('roles')->ignore(true)->insert($role);
        }
    }
}
