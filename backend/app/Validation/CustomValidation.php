<?php

namespace App\Validation;

class CustomValidation
{
    public function validVehiclePlate(?string $value): bool
    {
        if ($value === null || $value === '') {
            return true;
        }

        $plate = strtoupper(preg_replace('/[^A-Z0-9]/i', '', $value ?? '') ?? '');

        return (bool) preg_match('/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/', $plate);
    }

    public function validCpf(?string $value): bool
    {
        if ($value === null || $value === '') {
            return true;
        }

        $cpf = preg_replace('/\D/', '', $value ?? '');

        if ($cpf === null || strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $sum = 0;

            for ($i = 0; $i < $t; $i++) {
                $sum += (int) $cpf[$i] * (($t + 1) - $i);
            }

            $digit = ((10 * $sum) % 11) % 10;

            if ((int) $cpf[$t] !== $digit) {
                return false;
            }
        }

        return true;
    }

    public function validCnpj(?string $value): bool
    {
        if ($value === null || $value === '') {
            return true;
        }

        $cnpj = preg_replace('/\D/', '', $value ?? '');

        if ($cnpj === null || strlen($cnpj) !== 14 || preg_match('/^(\d)\1{13}$/', $cnpj)) {
            return false;
        }

        for ($t = 12; $t < 14; $t++) {
            $sum = 0;
            $weight = $t - 7;

            for ($i = 0; $i < $t; $i++) {
                $sum += (int) $cnpj[$i] * $weight;
                $weight = $weight === 2 ? 9 : $weight - 1;
            }

            $digit = $sum % 11 < 2 ? 0 : 11 - ($sum % 11);

            if ((int) $cnpj[$t] !== $digit) {
                return false;
            }
        }

        return true;
    }
}
