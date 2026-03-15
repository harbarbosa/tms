<?php

namespace App\Controllers\Api\V1;

use App\Models\LoadModel;
use App\Models\LoadOrderModel;
use App\Models\TransportOrderModel;
use App\Validation\LoadValidation;
use CodeIgniter\I18n\Time;

class LoadController extends BaseApiController
{
    private const STATUS_FLOW = [
        'planejada',
        'em_montagem',
        'pronta',
        'em_transporte',
        'entregue',
        'cancelada',
    ];

    private LoadOrderModel $loadOrders;

    private TransportOrderModel $transportOrders;

    public function __construct(private readonly LoadModel $loads = new LoadModel())
    {
        $this->loadOrders = new LoadOrderModel();
        $this->transportOrders = new TransportOrderModel();
    }

    public function index()
    {
        $this->requirePermission('loads.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $origin = trim((string) ($this->request->getGet('origem') ?? ''));
        $destination = trim((string) ($this->request->getGet('destino') ?? ''));
        $periodStart = trim((string) ($this->request->getGet('data_inicio') ?? ''));
        $periodEnd = trim((string) ($this->request->getGet('data_fim') ?? ''));

        $builder = $this->loads
            ->select('loads.*, (SELECT COUNT(*) FROM load_orders WHERE load_orders.load_id = loads.id) as orders_count')
            ->where('company_id', $companyId)
            ->orderBy('id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('codigo_carga', $search)
                ->orLike('origem_nome', $search)
                ->orLike('destino_nome', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        if ($origin !== '') {
            $builder->groupStart()
                ->like('origem_nome', $origin)
                ->orLike('origem_cidade', $origin)
                ->groupEnd();
        }

        if ($destination !== '') {
            $builder->groupStart()
                ->like('destino_nome', $destination)
                ->orLike('destino_cidade', $destination)
                ->groupEnd();
        }

        if ($periodStart !== '') {
            $builder->where('data_prevista_saida >=', $periodStart);
        }

        if ($periodEnd !== '') {
            $builder->where('data_prevista_entrega <=', $periodEnd);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->loads->pager;

        return $this->respondSuccess([
            'items' => $items,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'pageCount' => $pager->getPageCount(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'origem' => $origin,
                'destino' => $destination,
                'data_inicio' => $periodStart,
                'data_fim' => $periodEnd,
            ],
            'statusOptions' => self::STATUS_FLOW,
        ], 'Cargas carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('loads.view');
        $load = $this->findLoadOrFail($id);

        return $this->respondSuccess([
            ...$load,
            'orders' => $this->getAssignedOrders($id),
            'available_orders' => $this->getAvailableOrders((int) $load['company_id'], $id),
            'statusOptions' => self::STATUS_FLOW,
        ], 'Carga carregada com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('loads.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, LoadValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a carga.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;
        $data['codigo_carga'] = $this->generateLoadCode($companyId);

        $this->loads->insert($data);
        $load = $this->loads->find((int) $this->loads->getInsertID());

        return $this->respondSuccess($load, 'Carga criada com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('loads.update');
        $load = $this->findLoadOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, LoadValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar a carga.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $load['company_id'];
        $data['codigo_carga'] = $load['codigo_carga'];

        $this->loads->update($id, $data);

        return $this->respondSuccess($this->loads->find($id), 'Carga atualizada com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('loads.delete');
        $this->findLoadOrFail($id);
        $this->loads->delete($id);

        return $this->respondSuccess(null, 'Carga excluida com sucesso.');
    }

    public function syncOrders(int $id)
    {
        $this->requirePermission('loads.update');
        $load = $this->findLoadOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $orderIds = array_values(array_unique(array_map('intval', $payload['order_ids'] ?? [])));

        $companyId = (int) $load['company_id'];
        if ($orderIds !== []) {
            $availableOrders = $this->transportOrders
                ->where('company_id', $companyId)
                ->whereIn('id', $orderIds)
                ->findAll();

            if (count($availableOrders) !== count($orderIds)) {
                return $this->respondError('Nao foi possivel vincular os pedidos.', [
                    'order_ids' => 'Um ou mais pedidos informados sao invalidos para a empresa atual.',
                ], 422);
            }
        }

        $this->loadOrders->where('load_id', $id)->delete();

        foreach ($orderIds as $orderId) {
            $this->loadOrders->insert([
                'load_id' => $id,
                'transport_order_id' => $orderId,
            ]);
        }

        $this->recalculateTotals($id);

        return $this->respondSuccess([
            'load' => $this->loads->find($id),
            'orders' => $this->getAssignedOrders($id),
        ], 'Pedidos vinculados a carga com sucesso.');
    }

    private function findLoadOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $load = $this->loads->where('company_id', $companyId)->find($id);

        if ($load === null) {
            throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound('Carga nao encontrada.');
        }

        return $load;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'origem_nome',
            'origem_cidade',
            'origem_estado',
            'destino_nome',
            'destino_cidade',
            'destino_estado',
            'data_prevista_saida',
            'data_prevista_entrega',
            'peso_total',
            'volume_total',
            'valor_total',
            'observacoes',
            'status',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['peso_total', 'volume_total', 'valor_total', 'observacoes'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['origem_estado'] = strtoupper((string) $data['origem_estado']);
        $data['destino_estado'] = strtoupper((string) $data['destino_estado']);
        $data['status'] = $data['status'] ?: 'planejada';

        return $data;
    }

    private function generateLoadCode(int $companyId): string
    {
        $datePrefix = Time::now()->format('Ymd');
        $basePrefix = sprintf('CRG-%d-%s', $companyId, $datePrefix);
        $count = $this->loads
            ->where('company_id', $companyId)
            ->like('codigo_carga', $basePrefix, 'after')
            ->withDeleted()
            ->countAllResults();

        return sprintf('%s-%04d', $basePrefix, $count + 1);
    }

    private function getAssignedOrders(int $loadId): array
    {
        return $this->loadOrders
            ->select('transport_orders.id, transport_orders.numero_pedido, transport_orders.cliente_nome, transport_orders.cidade_entrega, transport_orders.estado_entrega, transport_orders.peso_total, transport_orders.volume_total, transport_orders.valor_mercadoria, transport_orders.status')
            ->join('transport_orders', 'transport_orders.id = load_orders.transport_order_id')
            ->where('load_orders.load_id', $loadId)
            ->findAll();
    }

    private function getAvailableOrders(int $companyId, int $loadId): array
    {
        $subQuery = $this->loadOrders->builder()->select('transport_order_id')->where('load_id !=', $loadId);

        return $this->transportOrders
            ->select('id, numero_pedido, cliente_nome, cidade_entrega, estado_entrega, peso_total, volume_total, valor_mercadoria, status')
            ->where('company_id', $companyId)
            ->whereNotIn('id', $subQuery, false)
            ->findAll();
    }

    private function recalculateTotals(int $loadId): void
    {
        $orders = $this->getAssignedOrders($loadId);

        $totals = array_reduce($orders, static function (array $carry, array $order) {
            $carry['peso_total'] += (float) ($order['peso_total'] ?? 0);
            $carry['volume_total'] += (float) ($order['volume_total'] ?? 0);
            $carry['valor_total'] += (float) ($order['valor_mercadoria'] ?? 0);

            return $carry;
        }, [
            'peso_total' => 0,
            'volume_total' => 0,
            'valor_total' => 0,
        ]);

        $this->loads->update($loadId, $totals);
    }
}
