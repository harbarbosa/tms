<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class TmsAuth extends BaseConfig
{
    public string $jwtIssuer = 'tms-api';

    public string $jwtAudience = 'tms-admin';

    public string $jwtSecret = '';

    public int $accessTokenTtl = 3600;

    public function __construct()
    {
        parent::__construct();

        $this->jwtIssuer      = env('tms.jwtIssuer', $this->jwtIssuer);
        $this->jwtAudience    = env('tms.jwtAudience', $this->jwtAudience);
        $this->jwtSecret      = env('tms.jwtSecret', env('encryption.key', 'change-this-secret-in-env'));
        $this->accessTokenTtl = (int) env('tms.accessTokenTtl', $this->accessTokenTtl);
    }
}
