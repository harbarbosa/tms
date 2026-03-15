<?php

namespace App\Libraries;

class AuthContext
{
    private ?array $user = null;

    private ?array $company = null;

    private array $claims = [];

    private array $access = [];

    public function setUser(?array $user): void
    {
        $this->user = $user;
    }

    public function getUser(): ?array
    {
        return $this->user;
    }

    public function setCompany(?array $company): void
    {
        $this->company = $company;
    }

    public function getCompany(): ?array
    {
        return $this->company;
    }

    public function setClaims(array $claims): void
    {
        $this->claims = $claims;
    }

    public function getClaims(): array
    {
        return $this->claims;
    }

    public function setAccess(array $access): void
    {
        $this->access = $access;
    }

    public function getAccess(): array
    {
        return $this->access;
    }

    public function getRole(): ?string
    {
        return $this->access['role']['slug'] ?? null;
    }

    public function getPermissions(): array
    {
        return $this->access['permissions'] ?? [];
    }

    public function getScope(): array
    {
        return $this->access['scope'] ?? [];
    }
}
