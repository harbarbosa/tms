<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\FreightHiringModel;
use App\Models\FreightQuotationModel;
use App\Models\FreightQuoteProposalModel;
use App\Models\LoadModel;
use App\Models\TransportDocumentModel;
use App\Models\TransportOrderModel;
use App\Validation\FreightHiringValidation;
use CodeIgniter\Exceptions\PageNotFoundException;
use CodeIgniter\I18n\Time;

class FreightHiringController extends BaseApiController
{
    private const STATUS_FLOW = ['pendente', 'contratado', 'cancelado', 'convertido_em_ot'];

    private FreightQuotationModel $quotations;

    private FreightQuoteProposalModel $proposals;

    private CarrierModel $carriers;

    private TransportOrderModel $orders;

    private LoadModel $loads;

    private TransportDocumentModel $documents;

    public function __construct(private readonly FreightHiringModel $hirings = new FreightHiringModel())
    {
        $this->quotations = new FreightQuotationModel();
        $this->proposals = new FreightQuoteProposalModel();
        $this->carriers = new CarrierModel();
        $this->orders = new TransportOrderModel();
        $this->loads = new LoadModel();
        $this->documents = new TransportDocumentModel();
    }

    public function index()
    {
        $this->requirePermission('freight_hirings.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);
        $referenceType = trim((string) ($this->request->getGet('tipo_referencia') ?? ''));
        $dateFrom = trim((string) ($this->request->getGet('data_inicio') ?? ''));
        $dateTo = trim((string) ($this->request->getGet('data_fim') ?? ''));

        $builder = $this->hirings
            ->select('freight_hirings.*, carriers.razao_social as transporter_name, freight_quotations.status as quotation_status, transport_documents.numero_ot')
            ->join('carriers', 'carriers.id = freight_hirings.transporter_id')
            ->join('freight_quotations', 'freight_quotations.id = freight_hirings.freight_quotation_id')
            ->join('transport_documents', 'transport_documents.id = freight_hirings.transport_document_id', 'left')
            ->where('freight_hirings.company_id', $companyId)
            ->orderBy('freight_hirings.id', 'DESC');

        if ($search !== '') {
            $builder->groupStart()
                ->like('carriers.razao_social', $search)
                ->orLike('freight_hirings.contratado_por', $search)
                ->orLike('freight_hirings.observacoes', $search)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('freight_hirings.status', $status);
        }

        if ($transporterId > 0) {
            $builder->where('freight_hirings.transporter_id', $transporterId);
        }

        if ($referenceType !== '') {
            $builder->where('freight_hirings.tipo_referencia', $referenceType);
        }

        if ($dateFrom !== '') {
            $builder->where('DATE(freight_hirings.data_contratacao) >=', $dateFrom);
        }

        if ($dateTo !== '') {
            $builder->where('DATE(freight_hirings.data_contratacao) <=', $dateTo);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->hirings->pager;

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
                'transporter_id' => $transporterId > 0 ? $transporterId : null,
                'tipo_referencia' => $referenceType,
                'data_inicio' => $dateFrom,
                'data_fim' => $dateTo,
            ],
            'statusOptions' => self::STATUS_FLOW,
        ], 'Contratacoes de frete carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('freight_hirings.view');
        $hiring = $this->findHiringOrFail($id);

        return $this->respondSuccess([
            ...$hiring,
            'reference_summary' => $this->buildReferenceSummary((int) $hiring['company_id'], $hiring['tipo_referencia'], (int) $hiring['referencia_id']),
            'proposal_summary' => $this->buildProposalSummary((int) $hiring['freight_quotation_proposal_id']),
            'options' => $this->buildOptions((int) $hiring['company_id']),
            'statusOptions' => self::STATUS_FLOW,
            'can_convert_to_ot' => in_array($hiring['status'], ['pendente', 'contratado'], true) && empty($hiring['transport_document_id']),
        ], 'Contratacao carregada com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('freight_hirings.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            ...$this->buildOptions($companyId),
            'statusOptions' => self::STATUS_FLOW,
        ], 'Opcoes da contratacao carregadas com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('freight_hirings.create');
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, FreightHiringValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a contratacao.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $data = $this->sanitizePayload($payload);
        $data['company_id'] = $companyId;
        $data['contratado_por'] = $data['contratado_por'] ?: ($this->authContext->getUser()['name'] ?? $this->authContext->getUser()['email'] ?? 'Sistema');

        $errors = $this->validateDomainRules($companyId, $data);
        if ($errors !== []) {
            return $this->respondError('Nao foi possivel salvar a contratacao.', $errors, 422);
        }

        $this->hirings->insert($data);
        $hiringId = (int) $this->hirings->getInsertID();
        $this->syncReferenceStatuses($companyId, $data);

        return $this->respondSuccess(
            $this->findHiringOrFail($hiringId),
            'Contratacao registrada com sucesso.',
            201
        );
    }

    public function update(int $id)
    {
        $this->requirePermission('freight_hirings.update');
        $hiring = $this->findHiringOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, FreightHiringValidation::rules())) {
            return $this->respondError('Nao foi possivel atualizar a contratacao.', $this->validator->getErrors(), 422);
        }

        $data = $this->sanitizePayload($payload);
        $data['company_id'] = (int) $hiring['company_id'];
        $data['transport_document_id'] = $hiring['transport_document_id'];

        $errors = $this->validateDomainRules((int) $hiring['company_id'], $data, $id);
        if ($errors !== []) {
            return $this->respondError('Nao foi possivel atualizar a contratacao.', $errors, 422);
        }

        $this->hirings->update($id, $data);
        $this->syncReferenceStatuses((int) $hiring['company_id'], $data);

        return $this->respondSuccess($this->findHiringOrFail($id), 'Contratacao atualizada com sucesso.');
    }

    public function convertToTransportDocument(int $id)
    {
        $this->requirePermission('transport_documents.create');
        $hiring = $this->findHiringOrFail($id);

        if (! empty($hiring['transport_document_id'])) {
            return $this->respondSuccess($this->findHiringOrFail($id), 'Esta contratacao ja foi convertida em OT.');
        }

        if ($hiring['status'] === 'cancelado') {
            return $this->respondError('Nao foi possivel gerar a OT.', [
                'status' => 'Contratacoes canceladas nao podem ser convertidas em OT.',
            ], 422);
        }

        $companyId = (int) $hiring['company_id'];
        $documentData = [
            'company_id' => $companyId,
            'numero_ot' => $this->generateDocumentNumber($companyId),
            'carga_id' => $hiring['tipo_referencia'] === 'carga' ? (int) $hiring['referencia_id'] : null,
            'pedido_id' => $hiring['tipo_referencia'] === 'pedido' ? (int) $hiring['referencia_id'] : null,
            'freight_hiring_id' => (int) $hiring['id'],
            'transporter_id' => (int) $hiring['transporter_id'],
            'driver_id' => null,
            'vehicle_id' => null,
            'data_coleta_prevista' => substr((string) $hiring['data_contratacao'], 0, 10),
            'data_entrega_prevista' => $this->calculateDeliveryDate((string) $hiring['data_contratacao'], (int) ($hiring['prazo_entrega_dias'] ?? 0)),
            'valor_frete_contratado' => $hiring['valor_contratado'],
            'status' => 'programada',
            'observacoes' => trim(sprintf(
                "OT gerada a partir da contratacao de frete #%d.\nCondicoes comerciais: %s\nObservacoes: %s",
                $hiring['id'],
                $hiring['condicoes_comerciais'] ?: '-',
                $hiring['observacoes'] ?: '-'
            )),
        ];

        $this->documents->insert($documentData);
        $documentId = (int) $this->documents->getInsertID();

        $this->hirings->update($id, [
            'transport_document_id' => $documentId,
            'status' => 'convertido_em_ot',
        ]);
        $this->syncReferenceStatuses($companyId, [
            'tipo_referencia' => $hiring['tipo_referencia'],
            'referencia_id' => $hiring['referencia_id'],
            'status' => 'convertido_em_ot',
        ]);

        return $this->respondSuccess($this->findHiringOrFail($id), 'Ordem de transporte gerada com sucesso a partir da contratacao.');
    }

    private function findHiringOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $hiring = $this->hirings
            ->select('freight_hirings.*, carriers.razao_social as transporter_name, freight_quotations.status as quotation_status, transport_documents.numero_ot')
            ->join('carriers', 'carriers.id = freight_hirings.transporter_id')
            ->join('freight_quotations', 'freight_quotations.id = freight_hirings.freight_quotation_id')
            ->join('transport_documents', 'transport_documents.id = freight_hirings.transport_document_id', 'left')
            ->where('freight_hirings.company_id', $companyId)
            ->find($id);

        if ($hiring === null) {
            throw PageNotFoundException::forPageNotFound('Contratacao nao encontrada.');
        }

        return $hiring;
    }

    private function sanitizePayload(array $payload): array
    {
        $fields = [
            'freight_quotation_id',
            'freight_quotation_proposal_id',
            'tipo_referencia',
            'referencia_id',
            'transporter_id',
            'valor_contratado',
            'prazo_entrega_dias',
            'condicoes_comerciais',
            'observacoes',
            'status',
            'contratado_por',
            'data_contratacao',
        ];

        $data = [];
        foreach ($fields as $field) {
            $value = $payload[$field] ?? null;
            $data[$field] = is_string($value) ? trim($value) : $value;
        }

        foreach (['valor_contratado', 'prazo_entrega_dias', 'condicoes_comerciais', 'observacoes', 'contratado_por'] as $nullableField) {
            if ($data[$nullableField] === '') {
                $data[$nullableField] = null;
            }
        }

        $data['status'] = $data['status'] ?: 'contratado';
        $data['data_contratacao'] = $data['data_contratacao'] ?: Time::now()->toDateTimeString();

        return $data;
    }

    private function validateDomainRules(int $companyId, array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        $quotation = $this->quotations
            ->where('company_id', $companyId)
            ->find((int) $data['freight_quotation_id']);

        if ($quotation === null) {
            $errors['freight_quotation_id'] = 'A cotacao informada nao pertence a empresa atual.';
            return $errors;
        }

        $proposal = $this->proposals
            ->where('cotacao_id', (int) $data['freight_quotation_id'])
            ->find((int) $data['freight_quotation_proposal_id']);

        if ($proposal === null) {
            $errors['freight_quotation_proposal_id'] = 'A proposta informada nao pertence a cotacao selecionada.';
            return $errors;
        }

        if ($quotation['status'] !== 'aprovada' || $proposal['status_resposta'] !== 'aprovada') {
            $errors['freight_quotation_proposal_id'] = 'A contratacao so pode ser criada a partir de uma proposta aprovada.';
        }

        if ((int) $proposal['transporter_id'] !== (int) $data['transporter_id']) {
            $errors['transporter_id'] = 'A transportadora deve corresponder a proposta aprovada.';
        }

        if ($quotation['tipo_referencia'] !== $data['tipo_referencia'] || (int) $quotation['referencia_id'] !== (int) $data['referencia_id']) {
            $errors['referencia_id'] = 'A referencia informada deve ser a mesma da cotacao aprovada.';
        }

        if (! $this->carriers->where('company_id', $companyId)->find((int) $data['transporter_id'])) {
            $errors['transporter_id'] = 'A transportadora selecionada nao pertence a empresa atual.';
        }

        if ($data['tipo_referencia'] === 'pedido' && ! $this->orders->where('company_id', $companyId)->find((int) $data['referencia_id'])) {
            $errors['referencia_id'] = 'O pedido selecionado nao pertence a empresa atual.';
        }

        if ($data['tipo_referencia'] === 'carga' && ! $this->loads->where('company_id', $companyId)->find((int) $data['referencia_id'])) {
            $errors['referencia_id'] = 'A carga selecionada nao pertence a empresa atual.';
        }

        $duplicate = $this->hirings
            ->where('company_id', $companyId)
            ->where('freight_quotation_proposal_id', (int) $data['freight_quotation_proposal_id']);

        if ($ignoreId !== null) {
            $duplicate->where('id !=', $ignoreId);
        }

        if ($duplicate->first() !== null) {
            $errors['freight_quotation_proposal_id'] = 'Ja existe uma contratacao registrada para esta proposta.';
        }

        return $errors;
    }

    private function syncReferenceStatuses(int $companyId, array $data): void
    {
        $referenceType = (string) ($data['tipo_referencia'] ?? '');
        $referenceId = (int) ($data['referencia_id'] ?? 0);
        $status = (string) ($data['status'] ?? '');

        if ($referenceId <= 0) {
            return;
        }

        if ($referenceType === 'pedido') {
            $nextStatus = in_array($status, ['contratado', 'convertido_em_ot'], true) ? 'contratado' : 'cotacao';
            if ($status === 'cancelado') {
                $nextStatus = 'cotacao';
            }

            $this->orders->where('company_id', $companyId)->update($referenceId, ['status' => $nextStatus]);
            return;
        }

        if ($referenceType === 'carga') {
            $nextStatus = 'em_montagem';

            if (in_array($status, ['contratado', 'convertido_em_ot'], true)) {
                $nextStatus = 'pronta';
            }

            $this->loads->where('company_id', $companyId)->update($referenceId, ['status' => $nextStatus]);
        }
    }

    private function buildOptions(int $companyId): array
    {
        $approvedQuotations = $this->quotations
            ->select('id, tipo_referencia, referencia_id, status')
            ->where('company_id', $companyId)
            ->where('status', 'aprovada')
            ->orderBy('id', 'DESC')
            ->findAll();

        $quotations = array_map(function (array $quotation) use ($companyId): array {
            $approvedProposals = $this->proposals
                ->select('freight_quote_proposals.id, freight_quote_proposals.transporter_id, freight_quote_proposals.valor_frete, freight_quote_proposals.prazo_entrega_dias, freight_quote_proposals.observacoes, carriers.razao_social as transporter_name')
                ->join('carriers', 'carriers.id = freight_quote_proposals.transporter_id')
                ->where('cotacao_id', (int) $quotation['id'])
                ->where('status_resposta', 'aprovada')
                ->findAll();

            return [
                'id' => (int) $quotation['id'],
                'tipo_referencia' => $quotation['tipo_referencia'],
                'referencia_id' => (int) $quotation['referencia_id'],
                'reference_summary' => $this->buildReferenceSummary($companyId, $quotation['tipo_referencia'], (int) $quotation['referencia_id']),
                'approved_proposals' => $approvedProposals,
            ];
        }, $approvedQuotations);

        return [
            'quotations' => $quotations,
            'transporters' => $this->carriers
                ->select('id, razao_social, nome_fantasia, status')
                ->where('company_id', $companyId)
                ->orderBy('razao_social', 'ASC')
                ->findAll(),
        ];
    }

    private function buildReferenceSummary(int $companyId, string $type, int $referenceId): array
    {
        if ($type === 'pedido') {
            $order = $this->orders
                ->select('id, numero_pedido, cliente_nome, cidade_entrega, estado_entrega, status')
                ->where('company_id', $companyId)
                ->find($referenceId);

            return [
                'label' => $order['numero_pedido'] ?? 'Pedido nao encontrado',
                'description' => isset($order['cliente_nome']) ? sprintf('%s - %s/%s', $order['cliente_nome'], $order['cidade_entrega'], $order['estado_entrega']) : null,
                'status' => $order['status'] ?? null,
            ];
        }

        $load = $this->loads
            ->select('id, codigo_carga, origem_cidade, origem_estado, destino_cidade, destino_estado, status')
            ->where('company_id', $companyId)
            ->find($referenceId);

        return [
            'label' => $load['codigo_carga'] ?? 'Carga nao encontrada',
            'description' => isset($load['origem_cidade']) ? sprintf('%s/%s -> %s/%s', $load['origem_cidade'], $load['origem_estado'], $load['destino_cidade'], $load['destino_estado']) : null,
            'status' => $load['status'] ?? null,
        ];
    }

    private function buildProposalSummary(int $proposalId): ?array
    {
        $proposal = $this->proposals
            ->select('freight_quote_proposals.*, carriers.razao_social as transporter_name')
            ->join('carriers', 'carriers.id = freight_quote_proposals.transporter_id')
            ->find($proposalId);

        if ($proposal === null) {
            return null;
        }

        return [
            'id' => (int) $proposal['id'],
            'transporter_name' => $proposal['transporter_name'],
            'valor_frete' => $proposal['valor_frete'],
            'prazo_entrega_dias' => $proposal['prazo_entrega_dias'],
            'observacoes' => $proposal['observacoes'],
            'status_resposta' => $proposal['status_resposta'],
        ];
    }

    private function generateDocumentNumber(int $companyId): string
    {
        $datePrefix = Time::now()->format('Ymd');
        $basePrefix = sprintf('OT-%d-%s', $companyId, $datePrefix);
        $count = $this->documents
            ->where('company_id', $companyId)
            ->like('numero_ot', $basePrefix, 'after')
            ->withDeleted()
            ->countAllResults();

        return sprintf('%s-%04d', $basePrefix, $count + 1);
    }

    private function calculateDeliveryDate(string $contractDate, int $deadlineDays): string
    {
        $base = Time::parse($contractDate);
        return $base->addDays(max(1, $deadlineDays))->toDateString();
    }
}
