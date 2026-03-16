<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class EnhanceCompaniesTable extends Migration
{
    public function up()
    {
        $fields = [
            'razao_social' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true, 'after' => 'slug'],
            'nome_fantasia' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true, 'after' => 'razao_social'],
            'cnpj' => ['type' => 'VARCHAR', 'constraint' => 18, 'null' => true, 'after' => 'nome_fantasia'],
            'email' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true, 'after' => 'cnpj'],
            'telefone' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true, 'after' => 'email'],
            'cep' => ['type' => 'VARCHAR', 'constraint' => 12, 'null' => true, 'after' => 'telefone'],
            'endereco' => ['type' => 'VARCHAR', 'constraint' => 180, 'null' => true, 'after' => 'cep'],
            'numero' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true, 'after' => 'endereco'],
            'complemento' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true, 'after' => 'numero'],
            'bairro' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true, 'after' => 'complemento'],
            'cidade' => ['type' => 'VARCHAR', 'constraint' => 120, 'null' => true, 'after' => 'bairro'],
            'estado' => ['type' => 'VARCHAR', 'constraint' => 2, 'null' => true, 'after' => 'cidade'],
            'tipo_empresa' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'embarcador', 'after' => 'status'],
            'limite_usuarios' => ['type' => 'INT', 'unsigned' => true, 'default' => 10, 'after' => 'tipo_empresa'],
            'limite_transportadoras' => ['type' => 'INT', 'unsigned' => true, 'default' => 10, 'after' => 'limite_usuarios'],
            'limite_veiculos' => ['type' => 'INT', 'unsigned' => true, 'default' => 50, 'after' => 'limite_transportadoras'],
            'limite_motoristas' => ['type' => 'INT', 'unsigned' => true, 'default' => 50, 'after' => 'limite_veiculos'],
        ];

        $this->forge->addColumn('companies', $fields);

        $this->db->query("
            UPDATE companies
            SET
                razao_social = COALESCE(NULLIF(legal_name, ''), name),
                nome_fantasia = COALESCE(NULLIF(name, ''), legal_name),
                cnpj = tax_id
            WHERE razao_social IS NULL
        ");

        $this->db->query("CREATE INDEX companies_status_index ON companies (status)");
        $this->db->query("CREATE INDEX companies_tipo_empresa_index ON companies (tipo_empresa)");
        $this->db->query("CREATE INDEX companies_cidade_index ON companies (cidade)");
    }

    public function down()
    {
        $this->db->query('DROP INDEX companies_status_index ON companies');
        $this->db->query('DROP INDEX companies_tipo_empresa_index ON companies');
        $this->db->query('DROP INDEX companies_cidade_index ON companies');

        $this->forge->dropColumn('companies', [
            'razao_social',
            'nome_fantasia',
            'cnpj',
            'email',
            'telefone',
            'cep',
            'endereco',
            'numero',
            'complemento',
            'bairro',
            'cidade',
            'estado',
            'tipo_empresa',
            'limite_usuarios',
            'limite_transportadoras',
            'limite_veiculos',
            'limite_motoristas',
        ]);
    }
}
