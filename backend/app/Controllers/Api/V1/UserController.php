<?php

namespace App\Controllers\Api\V1;

use App\Models\UserModel;

class UserController extends BaseApiController
{
    public function __construct(private readonly UserModel $users = new UserModel())
    {
    }

    public function profile()
    {
        $this->requirePermission('users.view');

        $userId = (int) ($this->authContext->getUser()['id'] ?? 0);
        $user = $this->users
            ->select('id, uuid, name, email, carrier_id, driver_id, status, last_login_at, created_at')
            ->find($userId);

        return $this->respondSuccess($user, 'Perfil carregado com sucesso.');
    }
}
