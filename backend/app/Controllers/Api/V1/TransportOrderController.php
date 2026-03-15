<?php

namespace App\Controllers\Api\V1;

use App\Models\TransportOrderModel;
use App\Validation\TransportOrderValidation;
use CodeIgniter\I18n\Time;

class TransportOrderController extends BaseApiController
{
    private const STATUS_FLOW = [
        'pendente',
        'em_planejamento',
        'cotacao',
        'contratado',
        'em_transporte',
        'entregue',
        'cancelado',
    ];

    public function __construct(private readonly TransportOrderModel $orders = new TransportOrderModel())
    {
    }

    public function index()
    {
        $this->requirePermission('transport_orders.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $deliveryDate = trim((string) ($this->request->getGet('data_prevista_entrega') ?? ''));

        $builder = $this->orders
            ->where('company_id', $companyId)
            ->orderBy('id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('numero_pedido', $search)
                ->orLike('cliente_nome', $search)
                ->orLike('documento_cliente', $search)
                ->orLike('cidade_entrega', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        if ($deliveryDate !== '') {
            $builder->where('data_prevista_entrega', $deliveryDate);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->orders->pager;

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
                'data_prevista_entrega' => $deliveryDate,
            ],
            'statusOptions' => self::STATUS_FLOW,
        ], 'Pedidos de transporte carregados com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('transport_orders.view');
        $order = $this->findOrderOrFail($id);

        return $this->respondSuccess([
            ...$order,
            'next_modules' => [
                'cargas' => true,
                'cotacao' => true,
                'ordem_transporte' => true,
                'rastreamento' => true,
            ],
        ], 'Pedido de transporte carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('transport_orders.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TransportOrderValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o pedido.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;
        $data['numero_pedido'] = $this->generateOrderNumber($companyId);

        $this->orders->insert($data);
        $order = $this->orders->find((int) $this->orders->getInsertID());

        return $this->respondSuccess($order, 'Pedido de transporte criado com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('transport_orders.update');
        $order = $this->findOrderOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, TransportOrderValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar o pedido.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $order['company_id'];
        $data['numero_pedido'] = $order['numero_pedido'];

        $this->orders->update($id, $data);

        return $this->respondSuccess($this->orders->find($id), 'Pedido de transporte atualizado com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('transport_orders.delete');
        $this->findOrderOrFail($id);
        $this->orders->delete($id);

        return $this->respondSuccess(null, 'Pedido de transporte excluido com sucesso.');
    }

    private function findOrderOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $order = $this->orders->where('company_id', $companyId)->find($id);

        if ($order === null) {
            throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound('Pedido de transporte nao encontrado.');
        }

        return $order;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'cliente_nome',
            'documento_cliente',
            'cep_entrega',
            'endereco_entrega',
            'numero_entrega',
            'bairro_entrega',
            'cidade_entrega',
            'estado_entrega',
            'data_prevista_entrega',
            'peso_total',
            'volume_total',
            'valor_mercadoria',
            'observacoes',
            'status',
        ];

        $data = [];

        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach ([
            'documento_cliente',
            'cep_entrega',
            'numero_entrega',
            'bairro_entrega',
            'peso_total',
            'volume_total',
            'valor_mercadoria',
            'observacoes',
        ] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['estado_entrega'] = strtoupper((string) $data['estado_entrega']);
        $data['status'] = $data['status'] ?: 'pendente';

        return $data;
    }

    private function generateOrderNumber(int $companyId): string
    {
        $datePrefix = Time::now()->format('Ymd');
        $basePrefix = sprintf('PED-%d-%s', $companyId, $datePrefix);
        $count = $this->orders
            ->where('company_id', $companyId)
            ->like('numero_pedido', $basePrefix, 'after')
            ->withDeleted()
            ->countAllResults();

        return sprintf('%s-%04d', $basePrefix, $count + 1);
    }
}
