<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\FreightQuotationModel;
use App\Models\FreightQuoteProposalModel;
use App\Models\LoadModel;
use App\Models\TransportOrderModel;
use App\Validation\FreightQuotationValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class FreightQuotationController extends BaseApiController
{
    private const QUOTATION_STATUSES = ['rascunho', 'enviada', 'em_analise', 'aprovada', 'cancelada', 'expirada'];

    private const PROPOSAL_STATUSES = ['pendente', 'respondida', 'recusada', 'aprovada'];

    private CarrierModel $carriers;

    private TransportOrderModel $orders;

    private LoadModel $loads;

    private FreightQuoteProposalModel $proposals;

    public function __construct(private readonly FreightQuotationModel $quotations = new FreightQuotationModel())
    {
        $this->carriers = new CarrierModel();
        $this->orders = new TransportOrderModel();
        $this->loads = new LoadModel();
        $this->proposals = new FreightQuoteProposalModel();
    }

    public function index()
    {
        $this->requirePermission('freight_quotations.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $referenceType = trim((string) ($this->request->getGet('tipo_referencia') ?? ''));
        $dateFrom = trim((string) ($this->request->getGet('data_envio_inicio') ?? ''));
        $dateTo = trim((string) ($this->request->getGet('data_envio_fim') ?? ''));

        $builder = $this->quotations
            ->select('freight_quotations.*, (SELECT COUNT(*) FROM freight_quote_proposals WHERE freight_quote_proposals.cotacao_id = freight_quotations.id AND freight_quote_proposals.deleted_at IS NULL) as proposals_count')
            ->where('company_id', $companyId)
            ->orderBy('id', 'DESC');

        $this->applyQuotationScope($builder);

        if ($search !== '') {
            $builder->groupStart()
                ->like('observacoes', $search)
                ->orLike('tipo_referencia', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('status', $status);
        }

        if ($referenceType !== '') {
            $builder->where('tipo_referencia', $referenceType);
        }

        if ($dateFrom !== '') {
            $builder->where('data_envio >=', $dateFrom);
        }

        if ($dateTo !== '') {
            $builder->where('data_envio <=', $dateTo);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->quotations->pager;

        $items = array_map(fn (array $item): array => [
            ...$item,
            'reference_summary' => $this->buildReferenceSummary($companyId, $item['tipo_referencia'], (int) $item['referencia_id']),
        ], $items);

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
                'tipo_referencia' => $referenceType,
                'data_envio_inicio' => $dateFrom,
                'data_envio_fim' => $dateTo,
            ],
            'statusOptions' => self::QUOTATION_STATUSES,
            'proposalStatusOptions' => self::PROPOSAL_STATUSES,
        ], 'Cotacoes carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('freight_quotations.view');
        $quotation = $this->findQuotationOrFail($id);

        return $this->respondSuccess([
            ...$quotation,
            'reference_summary' => $this->buildReferenceSummary(
                (int) $quotation['company_id'],
                $quotation['tipo_referencia'],
                (int) $quotation['referencia_id']
            ),
            'proposals' => $this->getProposals($id),
            'options' => $this->buildOptions((int) $quotation['company_id']),
            'statusOptions' => self::QUOTATION_STATUSES,
            'proposalStatusOptions' => self::PROPOSAL_STATUSES,
        ], 'Cotacao carregada com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('freight_quotations.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            ...$this->buildOptions($companyId),
            'statusOptions' => self::QUOTATION_STATUSES,
            'proposalStatusOptions' => self::PROPOSAL_STATUSES,
        ], 'Opcoes da cotacao carregadas com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('freight_quotations.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, FreightQuotationValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a cotacao.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;

        $errors = $this->validateDomainRules($companyId, $data, $payload['proposals'] ?? []);

        if ($errors !== []) {
            return $this->respondError('Nao foi possivel salvar a cotacao.', $errors, 422);
        }

        $this->quotations->insert($data);
        $quotationId = (int) $this->quotations->getInsertID();
        $this->syncProposals($quotationId, $companyId, $payload['proposals'] ?? []);
        $this->markReferenceAsInQuotation($companyId, $data['tipo_referencia'], (int) $data['referencia_id']);

        return $this->respondSuccess($this->buildQuotationPayload($quotationId), 'Cotacao criada com sucesso.', 201);
    }

    public function update(int $id)
    {
        $this->requirePermission('freight_quotations.update');
        $quotation = $this->findQuotationOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, FreightQuotationValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar a cotacao.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $quotation['company_id'];

        $errors = $this->validateDomainRules((int) $quotation['company_id'], $data, $payload['proposals'] ?? []);

        if ($errors !== []) {
            return $this->respondError('Nao foi possivel atualizar a cotacao.', $errors, 422);
        }

        $this->quotations->update($id, $data);
        $this->syncProposals($id, (int) $quotation['company_id'], $payload['proposals'] ?? []);

        return $this->respondSuccess($this->buildQuotationPayload($id), 'Cotacao atualizada com sucesso.');
    }

    public function approveProposal(int $id, int $proposalId)
    {
        $this->requirePermission('freight_quotations.approve');
        $quotation = $this->findQuotationOrFail($id);
        $proposal = $this->proposals
            ->where('cotacao_id', $id)
            ->find($proposalId);

        if ($proposal === null) {
            throw PageNotFoundException::forPageNotFound('Proposta nao encontrada.');
        }

        $this->proposals->where('cotacao_id', $id)->set(['status_resposta' => 'recusada'])->update();
        $this->proposals->update($proposalId, ['status_resposta' => 'aprovada']);
        $this->quotations->update($id, ['status' => 'aprovada']);
        $this->markReferenceAsContracted((int) $quotation['company_id'], $quotation['tipo_referencia'], (int) $quotation['referencia_id']);

        return $this->respondSuccess($this->buildQuotationPayload($id), 'Proposta aprovada com sucesso.');
    }

    public function delete(int $id)
    {
        $this->requirePermission('freight_quotations.delete');
        $this->findQuotationOrFail($id);
        $this->proposals->where('cotacao_id', $id)->delete();
        $this->quotations->delete($id);

        return $this->respondSuccess(null, 'Cotacao excluida com sucesso.');
    }

    private function findQuotationOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->quotations->where('company_id', $companyId)->where('freight_quotations.id', $id);
        $this->applyQuotationScope($builder);
        $quotation = $builder->first();

        if ($quotation === null) {
            throw PageNotFoundException::forPageNotFound('Cotacao nao encontrada.');
        }

        return $quotation;
    }

    private function applyQuotationScope($builder): void
    {
        $role = $this->getCurrentRole();
        $scope = $this->getCurrentScope();

        if ($role !== 'carrier') {
            return;
        }

        $carrierId = (int) ($scope['carrier_id'] ?? 0);

        if ($carrierId <= 0) {
            $builder->where('freight_quotations.id', 0);
            return;
        }

        $builder
            ->join('freight_quote_proposals scoped_proposals', 'scoped_proposals.cotacao_id = freight_quotations.id AND scoped_proposals.deleted_at IS NULL')
            ->where('scoped_proposals.transporter_id', $carrierId)
            ->groupBy('freight_quotations.id');
    }

    private function sanitizePayload(array $payload): array
    {
        $data = [];

        foreach (['tipo_referencia', 'referencia_id', 'data_envio', 'data_limite_resposta', 'status', 'observacoes'] as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        if ($data['observacoes'] === '') {
            $data['observacoes'] = null;
        }

        return $data;
    }

    private function validateDomainRules(int $companyId, array $data, array $proposals): array
    {
        $errors = [];

        if ($data['data_limite_resposta'] < $data['data_envio']) {
            $errors['data_limite_resposta'] = 'A data limite deve ser igual ou posterior a data de envio.';
        }

        if (! $this->referenceExists($companyId, $data['tipo_referencia'], (int) $data['referencia_id'])) {
            $errors['referencia_id'] = 'A referencia selecionada nao pertence a empresa atual.';
        }

        if ($proposals === []) {
            $errors['proposals'] = 'Adicione ao menos uma transportadora para cotacao.';
        }

        $transporterIds = [];

        foreach ($proposals as $index => $proposal) {
            $transporterId = (int) ($proposal['transporter_id'] ?? 0);
            $status = trim((string) ($proposal['status_resposta'] ?? 'pendente'));

            if ($transporterId <= 0) {
                $errors["proposals.$index.transporter_id"] = 'Selecione uma transportadora.';
                continue;
            }

            if (in_array($transporterId, $transporterIds, true)) {
                $errors["proposals.$index.transporter_id"] = 'Nao repita a mesma transportadora na cotacao.';
            }

            if (! $this->carrierExistsForCompany($companyId, $transporterId)) {
                $errors["proposals.$index.transporter_id"] = 'A transportadora informada nao pertence a empresa atual.';
            }

            if ($status === '' || ! in_array($status, self::PROPOSAL_STATUSES, true)) {
                $errors["proposals.$index.status_resposta"] = 'Informe um status de resposta valido.';
            }

            $transporterIds[] = $transporterId;
        }

        return $errors;
    }

    private function referenceExists(int $companyId, string $type, int $referenceId): bool
    {
        if ($type === 'pedido') {
            return $this->orders->where('company_id', $companyId)->where('id', $referenceId)->first() !== null;
        }

        return $this->loads->where('company_id', $companyId)->where('id', $referenceId)->first() !== null;
    }

    private function carrierExistsForCompany(int $companyId, int $carrierId): bool
    {
        return $this->carriers->where('company_id', $companyId)->where('id', $carrierId)->first() !== null;
    }

    private function syncProposals(int $quotationId, int $companyId, array $proposals): void
    {
        $this->proposals->where('cotacao_id', $quotationId)->delete();

        foreach ($proposals as $proposal) {
            $this->proposals->insert([
                'cotacao_id' => $quotationId,
                'transporter_id' => (int) ($proposal['transporter_id'] ?? 0),
                'valor_frete' => $proposal['valor_frete'] !== '' ? $proposal['valor_frete'] ?? null : null,
                'prazo_entrega_dias' => $proposal['prazo_entrega_dias'] !== '' ? $proposal['prazo_entrega_dias'] ?? null : null,
                'observacoes' => trim((string) ($proposal['observacoes'] ?? '')) ?: null,
                'status_resposta' => trim((string) ($proposal['status_resposta'] ?? 'pendente')),
            ]);
        }
    }

    private function getProposals(int $quotationId): array
    {
        return $this->proposals
            ->select('freight_quote_proposals.*, carriers.razao_social as transporter_name, carriers.nome_fantasia')
            ->join('carriers', 'carriers.id = freight_quote_proposals.transporter_id')
            ->where('cotacao_id', $quotationId)
            ->findAll();
    }

    private function buildQuotationPayload(int $quotationId): array
    {
        $quotation = $this->quotations->find($quotationId);

        return [
            ...$quotation,
            'reference_summary' => $this->buildReferenceSummary(
                (int) $quotation['company_id'],
                $quotation['tipo_referencia'],
                (int) $quotation['referencia_id']
            ),
            'proposals' => $this->getProposals($quotationId),
        ];
    }

    private function buildReferenceSummary(int $companyId, string $type, int $referenceId): array
    {
        if ($type === 'pedido') {
            $order = $this->orders
                ->select('id, numero_pedido, cliente_nome, cidade_entrega, estado_entrega, data_prevista_entrega, status')
                ->where('company_id', $companyId)
                ->find($referenceId);

            return [
                'label' => $order['numero_pedido'] ?? 'Pedido nao encontrado',
                'description' => isset($order['cliente_nome']) ? sprintf('%s - %s/%s', $order['cliente_nome'], $order['cidade_entrega'], $order['estado_entrega']) : null,
                'status' => $order['status'] ?? null,
            ];
        }

        $load = $this->loads
            ->select('id, codigo_carga, origem_cidade, origem_estado, destino_cidade, destino_estado, data_prevista_entrega, status')
            ->where('company_id', $companyId)
            ->find($referenceId);

        return [
            'label' => $load['codigo_carga'] ?? 'Carga nao encontrada',
            'description' => isset($load['origem_cidade']) ? sprintf('%s/%s -> %s/%s', $load['origem_cidade'], $load['origem_estado'], $load['destino_cidade'], $load['destino_estado']) : null,
            'status' => $load['status'] ?? null,
        ];
    }

    private function buildOptions(int $companyId): array
    {
        $transporters = $this->carriers
                ->select('id, razao_social, nome_fantasia, cidade, estado, status')
                ->where('company_id', $companyId)
                ->orderBy('razao_social', 'ASC');
        $transportOrders = $this->orders
                ->select('id, numero_pedido, cliente_nome, cidade_entrega, estado_entrega, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC');
        $loads = $this->loads
                ->select('id, codigo_carga, origem_cidade, origem_estado, destino_cidade, destino_estado, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC');

        if ($this->getCurrentRole() === 'carrier') {
            $carrierId = (int) ($this->getCurrentScope()['carrier_id'] ?? 0);

            return [
                'transporters' => $carrierId > 0 ? $transporters->where('id', $carrierId)->findAll() : [],
                'transport_orders' => [],
                'loads' => [],
            ];
        }

        if ($this->getCurrentRole() === 'driver') {
            return [
                'transporters' => [],
                'transport_orders' => [],
                'loads' => [],
            ];
        }

        return [
            'transporters' => $transporters->findAll(),
            'transport_orders' => $transportOrders->findAll(),
            'loads' => $loads->findAll(),
        ];
    }

    private function markReferenceAsInQuotation(int $companyId, string $type, int $referenceId): void
    {
        if ($type === 'pedido') {
            $this->orders->where('company_id', $companyId)->update($referenceId, ['status' => 'cotacao']);
        }
    }

    private function markReferenceAsContracted(int $companyId, string $type, int $referenceId): void
    {
        if ($type === 'pedido') {
            $this->orders->where('company_id', $companyId)->update($referenceId, ['status' => 'contratado']);
        }
    }
}
