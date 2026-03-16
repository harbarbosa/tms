<?php

namespace App\Controllers\Api\V1;

use App\Models\CarrierModel;
use App\Models\CompanyModel;
use App\Models\FreightAuditModel;
use App\Models\FreightFinancialEntryModel;
use App\Models\FreightFinancialHistoryModel;
use App\Models\TransportDocumentModel;
use App\Services\SystemCatalogService;
use App\Validation\FinancialValidation;
use CodeIgniter\Exceptions\PageNotFoundException;
use CodeIgniter\I18n\Time;

class FinancialController extends BaseApiController
{
    private const STATUS_FLOW = ['pendente', 'em_analise', 'liberado', 'bloqueado', 'pago', 'cancelado'];

    private const PAYMENT_METHODS = ['pix', 'ted', 'boleto', 'deposito', 'outros'];

    private const APPROVAL_PENDING_STATUSES = ['pendente', 'em_analise'];

    private FreightAuditModel $audits;

    private TransportDocumentModel $documents;

    private CarrierModel $carriers;

    private CompanyModel $companies;

    private FreightFinancialHistoryModel $histories;

    private SystemCatalogService $catalogService;

    public function __construct(private readonly FreightFinancialEntryModel $entries = new FreightFinancialEntryModel())
    {
        $this->audits = new FreightAuditModel();
        $this->documents = new TransportDocumentModel();
        $this->carriers = new CarrierModel();
        $this->companies = new CompanyModel();
        $this->histories = new FreightFinancialHistoryModel();
        $this->catalogService = new SystemCatalogService();
    }

    public function summary()
    {
        $this->requirePermission('financial.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        [$dateFrom, $dateTo] = $this->resolvePeriod();

        $baseBuilder = $this->entries
            ->where('company_id', $companyId)
            ->where('deleted_at', null);

        $this->applyCarrierScope($baseBuilder, 'freight_financial_entries');

        if ($dateFrom !== null) {
            $baseBuilder->where('created_at >=', $dateFrom . ' 00:00:00');
        }

        if ($dateTo !== null) {
            $baseBuilder->where('created_at <=', $dateTo . ' 23:59:59');
        }

        $items = $baseBuilder->findAll();

        $cards = [
            'pendente' => 0,
            'bloqueado' => 0,
            'liberado' => 0,
            'pago_mes' => 0,
        ];

        foreach ($items as $item) {
            if ($item['status'] === 'pendente' || $item['status'] === 'em_analise') {
                $cards['pendente'] += (float) ($item['valor_previsto'] ?? 0);
            }

            if ($item['status'] === 'bloqueado') {
                $cards['bloqueado'] += (float) ($item['valor_previsto'] ?? 0);
            }

            if ($item['status'] === 'liberado') {
                $cards['liberado'] += (float) ($item['valor_aprovado'] ?? $item['valor_previsto'] ?? 0);
            }

            if ($item['status'] === 'pago') {
                $cards['pago_mes'] += (float) ($item['valor_pago'] ?? 0);
            }
        }

        return $this->respondSuccess([
            'cards' => $cards,
        ], 'Resumo financeiro carregado com sucesso.');
    }

    public function index()
    {
        $this->requirePermission('financial.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $transporterId = (int) ($this->request->getGet('transporter_id') ?? 0);
        $companyFilter = (int) ($this->request->getGet('company_id') ?? 0);
        $dateFrom = trim((string) ($this->request->getGet('data_inicio') ?? ''));
        $dateTo = trim((string) ($this->request->getGet('data_fim') ?? ''));
        $approvalPending = trim((string) ($this->request->getGet('approval_pending') ?? ''));

        $builder = $this->entries
            ->select('freight_financial_entries.*, transport_documents.numero_ot, carriers.razao_social as transporter_name, freight_audits.status_auditoria, freight_audits.diferenca_valor, companies.nome_fantasia, companies.razao_social')
            ->join('transport_documents', 'transport_documents.id = freight_financial_entries.transport_document_id')
            ->join('freight_audits', 'freight_audits.id = freight_financial_entries.freight_audit_id')
            ->join('carriers', 'carriers.id = freight_financial_entries.transporter_id')
            ->join('companies', 'companies.id = freight_financial_entries.company_id')
            ->where('freight_financial_entries.company_id', $companyId)
            ->orderBy('freight_financial_entries.id', 'DESC');

        $this->applyCarrierScope($builder);

        if ($status !== '') {
            $builder->where('freight_financial_entries.status', $status);
        }

        if ($transporterId > 0) {
            $builder->where('freight_financial_entries.transporter_id', $transporterId);
        }

        if ($companyFilter > 0) {
            $builder->where('freight_financial_entries.company_id', $companyFilter);
        }

        if ($dateFrom !== '') {
            $builder->where('COALESCE(freight_financial_entries.data_prevista_pagamento, DATE(freight_financial_entries.created_at)) >=', $dateFrom);
        }

        if ($dateTo !== '') {
            $builder->where('COALESCE(freight_financial_entries.data_prevista_pagamento, DATE(freight_financial_entries.created_at)) <=', $dateTo);
        }

        if ($approvalPending === '1') {
            $builder->whereIn('freight_financial_entries.status', self::APPROVAL_PENDING_STATUSES);
        }

        if ($approvalPending === '0') {
            $builder->whereNotIn('freight_financial_entries.status', self::APPROVAL_PENDING_STATUSES);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->entries->pager;

        $items = array_map(fn (array $item): array => [
            ...$item,
            'approval_pending' => in_array($item['status'], self::APPROVAL_PENDING_STATUSES, true),
            'operational_flags' => [
                'blocked_by_divergence' => (float) ($item['diferenca_valor'] ?? 0) !== 0 || $item['status_auditoria'] === 'divergente',
            ],
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
                'status' => $status,
                'transporter_id' => $transporterId > 0 ? $transporterId : null,
                'company_id' => $companyFilter > 0 ? $companyFilter : null,
                'data_inicio' => $dateFrom,
                'data_fim' => $dateTo,
                'approval_pending' => $approvalPending,
            ],
            'statusOptions' => self::STATUS_FLOW,
        ], 'Lancamentos financeiros carregados com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('financial.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $catalogs = $this->catalogService->groupedOptions($companyId, ['payment_methods', 'financial_block_reasons']);

        return $this->respondSuccess([
            'statusOptions' => self::STATUS_FLOW,
            'paymentMethods' => array_map(static fn (array $item): string => $item['label'], $catalogs['payment_methods'] ?? []),
            'blockReasonOptions' => array_map(static fn (array $item): string => $item['label'], $catalogs['financial_block_reasons'] ?? []),
            'companies' => $this->companies
                ->select('id, razao_social, nome_fantasia, status')
                ->where('id', $companyId)
                ->findAll(),
            'transporters' => $this->applyCarrierScope(
                $this->carriers
                ->select('id, razao_social, nome_fantasia, status')
                ->where('company_id', $companyId)
                ->orderBy('razao_social', 'ASC')
            , 'carriers')->findAll(),
            'audits' => $this->applyCarrierScope(
                $this->audits
                ->select('freight_audits.id, freight_audits.ordem_transporte_id, freight_audits.valor_contratado, freight_audits.valor_cobrado, freight_audits.diferenca_valor, freight_audits.status_auditoria, transport_documents.numero_ot, transport_documents.transporter_id, carriers.razao_social as transporter_name')
                ->join('transport_documents', 'transport_documents.id = freight_audits.ordem_transporte_id')
                ->join('carriers', 'carriers.id = transport_documents.transporter_id')
                ->where('freight_audits.company_id', $companyId)
                ->where('freight_audits.deleted_at', null)
                ->orderBy('freight_audits.id', 'DESC')
            )->findAll(),
        ], 'Opcoes financeiras carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('financial.view');
        $entry = $this->findEntryOrFail($id);

        return $this->respondSuccess([
            ...$entry,
            'statusOptions' => self::STATUS_FLOW,
            'paymentMethods' => array_map(
                static fn (array $item): string => $item['label'],
                $this->catalogService->getCatalogItems((int) $entry['company_id'], 'payment_methods')
            ),
            'blockReasonOptions' => array_map(
                static fn (array $item): string => $item['label'],
                $this->catalogService->getCatalogItems((int) $entry['company_id'], 'financial_block_reasons')
            ),
            'history' => $this->loadHistory((int) $entry['id']),
            'can_liberate' => $this->canLiberate($entry),
            'can_approve' => $this->canApprove($entry),
            'can_reject' => in_array($entry['status'], self::APPROVAL_PENDING_STATUSES, true),
            'can_block' => in_array($entry['status'], ['pendente', 'em_analise', 'liberado'], true),
            'can_mark_paid' => $entry['status'] === 'liberado',
            'can_cancel' => $entry['status'] !== 'cancelado' && $entry['status'] !== 'pago',
            'operational_flags' => [
                'blocked_by_divergence' => (float) ($entry['diferenca_valor'] ?? 0) !== 0 || $entry['status_auditoria'] === 'divergente',
            ],
        ], 'Detalhe financeiro carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('financial.create');
        return $this->persist();
    }

    public function update(int $id)
    {
        $this->requirePermission('financial.update');
        return $this->persist($id);
    }

    public function approve(int $id)
    {
        $this->requirePermission('financial.update');
        $entry = $this->findEntryOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $reason = $this->resolveReason($payload, 'Aprovado pelo financeiro.');

        if (! $this->canApprove($entry)) {
            return $this->respondError('Nao foi possivel aprovar o lancamento.', [
                'status' => 'A aprovacao exige auditoria sem divergencia e lancamento em analise.',
            ], 422);
        }

        return $this->transitionEntry(
            $entry,
            [
                'status' => 'liberado',
                'valor_aprovado' => $entry['valor_aprovado'] ?: $entry['valor_previsto'],
                'motivo_bloqueio' => null,
            ],
            'aprovado',
            'Lancamento aprovado com sucesso.',
            $reason
        );
    }

    public function reject(int $id)
    {
        $this->requirePermission('financial.update');
        $entry = $this->findEntryOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $reason = $this->resolveReason($payload);

        if ($reason === '') {
            return $this->respondError('Nao foi possivel reprovar o lancamento.', [
                'motivo' => 'Informe o motivo da reprovacao.',
            ], 422);
        }

        return $this->transitionEntry(
            $entry,
            [
                'status' => 'bloqueado',
                'motivo_bloqueio' => $reason,
            ],
            'recusado',
            'Lancamento reprovado com sucesso.',
            $reason
        );
    }

    public function liberate(int $id)
    {
        $this->requirePermission('financial.update');
        $entry = $this->findEntryOrFail($id);

        if (! $this->canLiberate($entry)) {
            return $this->respondError('Nao foi possivel liberar o lancamento.', [
                'status' => 'Existe divergencia ou auditoria nao aprovada para este frete.',
            ], 422);
        }

        return $this->transitionEntry(
            $entry,
            [
                'status' => 'liberado',
                'valor_aprovado' => $entry['valor_aprovado'] ?: $entry['valor_previsto'],
                'motivo_bloqueio' => null,
            ],
            'liberado',
            'Lancamento liberado com sucesso.',
            'Liberacao manual do financeiro.'
        );
    }

    public function block(int $id)
    {
        $this->requirePermission('financial.update');
        $entry = $this->findEntryOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $reason = trim((string) ($payload['motivo_bloqueio'] ?? '')) ?: 'Bloqueado manualmente pelo financeiro.';

        return $this->transitionEntry(
            $entry,
            [
                'status' => 'bloqueado',
                'motivo_bloqueio' => $reason,
            ],
            'bloqueado',
            'Lancamento bloqueado com sucesso.',
            $reason
        );
    }

    public function markPaid(int $id)
    {
        $this->requirePermission('financial.update');
        $entry = $this->findEntryOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $paymentDate = trim((string) ($payload['data_pagamento'] ?? '')) ?: Time::now()->toDateString();
        $amountPaid = $payload['valor_pago'] ?? $entry['valor_aprovado'] ?? $entry['valor_previsto'];
        $paymentMethod = trim((string) ($payload['forma_pagamento'] ?? $entry['forma_pagamento'] ?? '')) ?: null;

        if ($entry['status'] !== 'liberado') {
            return $this->respondError('Nao foi possivel marcar como pago.', [
                'status' => 'Somente lancamentos liberados podem ser marcados como pagos.',
            ], 422);
        }

        return $this->transitionEntry(
            $entry,
            [
                'status' => 'pago',
                'valor_pago' => $amountPaid,
                'data_pagamento' => $paymentDate,
                'forma_pagamento' => $paymentMethod,
            ],
            'pago',
            'Pagamento registrado com sucesso.',
            trim((string) ($payload['observacoes'] ?? '')) ?: 'Pagamento conciliado no financeiro.',
            [
                'valor_pago' => $amountPaid,
                'data_pagamento' => $paymentDate,
                'forma_pagamento' => $paymentMethod,
            ]
        );
    }

    public function cancel(int $id)
    {
        $this->requirePermission('financial.update');
        $entry = $this->findEntryOrFail($id);
        $payload = $this->request->getJSON(true) ?? [];
        $notes = trim((string) ($payload['observacoes'] ?? ''));
        $mergedNotes = trim(($entry['observacoes'] ? $entry['observacoes'] . PHP_EOL : '') . ($notes !== '' ? $notes : 'Lancamento cancelado.'));

        return $this->transitionEntry(
            $entry,
            [
                'status' => 'cancelado',
                'observacoes' => $mergedNotes,
            ],
            'cancelado',
            'Lancamento cancelado com sucesso.',
            $notes !== '' ? $notes : 'Lancamento cancelado.'
        );
    }

    private function persist(?int $id = null)
    {
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, FinancialValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar o lancamento financeiro.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $auditId = (int) ($payload['freight_audit_id'] ?? 0);
        $audit = $this->audits->where('company_id', $companyId)->find($auditId);

        if ($audit === null) {
            return $this->respondError('Nao foi possivel salvar o lancamento financeiro.', [
                'freight_audit_id' => 'A auditoria informada nao pertence a empresa atual.',
            ], 422);
        }

        $documentId = (int) ($payload['transport_document_id'] ?? 0);
        $document = $this->documents->where('company_id', $companyId)->find($documentId);

        if ($document === null) {
            return $this->respondError('Nao foi possivel salvar o lancamento financeiro.', [
                'transport_document_id' => 'A OT informada nao pertence a empresa atual.',
            ], 422);
        }

        if ((int) $audit['ordem_transporte_id'] !== $documentId) {
            return $this->respondError('Nao foi possivel salvar o lancamento financeiro.', [
                'transport_document_id' => 'A OT deve corresponder a auditoria selecionada.',
            ], 422);
        }

        if ((int) ($document['transporter_id'] ?? 0) !== (int) ($payload['transporter_id'] ?? 0)) {
            return $this->respondError('Nao foi possivel salvar o lancamento financeiro.', [
                'transporter_id' => 'A transportadora deve corresponder a OT e a auditoria selecionadas.',
            ], 422);
        }

        if (! $id) {
            $duplicate = $this->entries
                ->where('company_id', $companyId)
                ->where('freight_audit_id', $auditId)
                ->first();

            if ($duplicate !== null) {
                return $this->respondError('Nao foi possivel salvar o lancamento financeiro.', [
                    'freight_audit_id' => 'Ja existe um lancamento financeiro para esta auditoria.',
                ], 422);
            }
        }

        $current = $id ? $this->findEntryOrFail($id) : null;
        $actor = $this->resolveActor();
        $hasDivergence = (float) ($audit['diferenca_valor'] ?? 0) !== 0 || ($audit['status_auditoria'] ?? '') === 'divergente';
        $status = trim((string) ($payload['status'] ?? ''));

        if ($status === '') {
            $status = $hasDivergence ? 'bloqueado' : 'pendente';
        }

        $data = [
            'company_id' => $companyId,
            'transport_document_id' => $documentId,
            'freight_audit_id' => $auditId,
            'transporter_id' => (int) $payload['transporter_id'],
            'valor_previsto' => $payload['valor_previsto'],
            'valor_aprovado' => $payload['valor_aprovado'] === '' || $payload['valor_aprovado'] === null ? null : $payload['valor_aprovado'],
            'valor_pago' => $payload['valor_pago'] === '' || $payload['valor_pago'] === null ? null : $payload['valor_pago'],
            'data_prevista_pagamento' => trim((string) ($payload['data_prevista_pagamento'] ?? '')) ?: null,
            'data_pagamento' => trim((string) ($payload['data_pagamento'] ?? '')) ?: null,
            'forma_pagamento' => trim((string) ($payload['forma_pagamento'] ?? '')) ?: null,
            'status' => $status,
            'motivo_bloqueio' => trim((string) ($payload['motivo_bloqueio'] ?? '')) ?: ($hasDivergence && $status === 'bloqueado' ? 'Bloqueado automaticamente por divergencia na auditoria.' : null),
            'observacoes' => trim((string) ($payload['observacoes'] ?? '')) ?: null,
            'criado_por' => $current['criado_por'] ?? $actor,
            'atualizado_por' => $actor,
        ];

        if ($current) {
            $this->entries->update($id, $data);
            $entryId = $id;
        } else {
            $this->entries->insert($data);
            $entryId = (int) $this->entries->getInsertID();
        }

        if ($current === null) {
            $this->recordHistory(
                $companyId,
                $entryId,
                'criado',
                null,
                $status,
                $data['observacoes'],
                [
                    'freight_audit_id' => $auditId,
                    'transport_document_id' => $documentId,
                    'valor_previsto' => $data['valor_previsto'],
                ]
            );

            if ($status === 'em_analise') {
                $this->recordHistory($companyId, $entryId, 'enviado_para_analise', 'pendente', 'em_analise', 'Lancamento enviado para analise.');
            }

            if ($status === 'bloqueado') {
                $this->recordHistory($companyId, $entryId, 'bloqueado', null, 'bloqueado', $data['motivo_bloqueio']);
            }
        } elseif (($current['status'] ?? null) !== $status && $status === 'em_analise') {
            $this->recordHistory($companyId, $entryId, 'enviado_para_analise', $current['status'], 'em_analise', 'Lancamento enviado para analise.');
        }

        return $this->respondSuccess(
            $this->findEntryOrFail($entryId),
            $current ? 'Lancamento financeiro atualizado com sucesso.' : 'Lancamento financeiro criado com sucesso.',
            $current ? 200 : 201
        );
    }

    private function findEntryOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->entries
            ->select('freight_financial_entries.*, transport_documents.numero_ot, carriers.razao_social as transporter_name, freight_audits.status_auditoria, freight_audits.diferenca_valor, freight_audits.valor_contratado, freight_audits.valor_cobrado, freight_audits.data_auditoria, companies.nome_fantasia, companies.razao_social')
            ->join('transport_documents', 'transport_documents.id = freight_financial_entries.transport_document_id')
            ->join('freight_audits', 'freight_audits.id = freight_financial_entries.freight_audit_id')
            ->join('carriers', 'carriers.id = freight_financial_entries.transporter_id')
            ->join('companies', 'companies.id = freight_financial_entries.company_id')
            ->where('freight_financial_entries.company_id', $companyId)
            ->where('freight_financial_entries.id', $id);

        $this->applyCarrierScope($builder);
        $entry = $builder->first();

        if ($entry === null) {
            throw PageNotFoundException::forPageNotFound('Lancamento financeiro nao encontrado.');
        }

        return $entry;
    }

    private function canLiberate(array $entry): bool
    {
        $hasDivergence = (float) ($entry['diferenca_valor'] ?? 0) !== 0 || ($entry['status_auditoria'] ?? '') === 'divergente';

        return ! $hasDivergence && in_array($entry['status_auditoria'], ['aprovado', 'pendente'], true) && $entry['status'] !== 'cancelado';
    }

    private function canApprove(array $entry): bool
    {
        return in_array($entry['status'], self::APPROVAL_PENDING_STATUSES, true) && $this->canLiberate($entry);
    }

    private function transitionEntry(
        array $entry,
        array $changes,
        string $event,
        string $message,
        ?string $reason = null,
        array $payload = []
    ) {
        $changes['atualizado_por'] = $this->resolveActor();
        $this->entries->update((int) $entry['id'], $changes);
        $updatedEntry = $this->findEntryOrFail((int) $entry['id']);

        $this->recordHistory(
            (int) $updatedEntry['company_id'],
            (int) $updatedEntry['id'],
            $event,
            $entry['status'] ?? null,
            $updatedEntry['status'] ?? null,
            $reason,
            $payload
        );

        return $this->respondSuccess($updatedEntry, $message);
    }

    private function loadHistory(int $entryId): array
    {
        return $this->histories
            ->where('freight_financial_entry_id', $entryId)
            ->orderBy('created_at', 'DESC')
            ->findAll();
    }

    private function recordHistory(
        int $companyId,
        int $entryId,
        string $event,
        ?string $previousStatus,
        ?string $nextStatus,
        ?string $reason = null,
        array $payload = []
    ): void {
        $this->histories->insert([
            'company_id' => $companyId,
            'freight_financial_entry_id' => $entryId,
            'evento' => $event,
            'status_anterior' => $previousStatus,
            'status_novo' => $nextStatus,
            'motivo' => $reason !== '' ? $reason : null,
            'payload_json' => $payload === [] ? null : json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'responsavel' => $this->resolveActor(),
        ]);
    }

    private function resolveActor(): string
    {
        $user = $this->authContext->getUser();

        return $user['name'] ?? $user['email'] ?? 'Sistema';
    }

    private function resolveReason(array $payload, string $fallback = ''): string
    {
        $fields = ['motivo', 'motivo_bloqueio', 'observacoes', 'reason'];

        foreach ($fields as $field) {
            $value = trim((string) ($payload[$field] ?? ''));

            if ($value !== '') {
                return $value;
            }
        }

        return $fallback;
    }

    private function resolvePeriod(): array
    {
        $startDate = trim((string) ($this->request->getGet('start_date') ?? ''));
        $endDate = trim((string) ($this->request->getGet('end_date') ?? ''));

        return [$startDate !== '' ? $startDate : null, $endDate !== '' ? $endDate : null];
    }

    private function applyCarrierScope($builder, string $alias = 'freight_financial_entries')
    {
        if ($this->getCurrentRole() !== 'carrier') {
            return $builder;
        }

        $carrierId = (int) ($this->getCurrentScope()['carrier_id'] ?? 0);

        if ($alias === 'carriers') {
            $builder->where('id', $carrierId);
            return $builder;
        }

        if ($alias === 'freight_audits') {
            $builder->where('transport_documents.transporter_id', $carrierId);
            return $builder;
        }

        $builder->where($alias . '.transporter_id', $carrierId);

        return $builder;
    }
}
