<?php

namespace App\Controllers\Api\V1;

use App\Models\DeliveryReceiptModel;
use App\Models\FreightAuditModel;
use App\Models\TransportDocumentModel;
use App\Models\TripDocumentModel;
use App\Validation\FreightAuditValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class FreightAuditController extends BaseApiController
{
    private const STATUSES = ['pendente', 'aprovado', 'divergente', 'recusado'];

    private TransportDocumentModel $transportDocuments;

    private TripDocumentModel $tripDocuments;

    private DeliveryReceiptModel $deliveryReceipts;

    public function __construct(private readonly FreightAuditModel $audits = new FreightAuditModel())
    {
        $this->transportDocuments = new TransportDocumentModel();
        $this->tripDocuments = new TripDocumentModel();
        $this->deliveryReceipts = new DeliveryReceiptModel();
    }

    public function index()
    {
        $this->requirePermission('freight_audits.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        $dateFrom = trim((string) ($this->request->getGet('data_inicio') ?? ''));
        $dateTo = trim((string) ($this->request->getGet('data_fim') ?? ''));
        $search = trim((string) ($this->request->getGet('search') ?? ''));

        $builder = $this->audits
            ->select('freight_audits.*, transport_documents.numero_ot, transport_documents.valor_frete_contratado, carriers.razao_social as transporter_name')
            ->join('transport_documents', 'transport_documents.id = freight_audits.ordem_transporte_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('freight_audits.company_id', $companyId)
            ->orderBy('freight_audits.data_auditoria', 'DESC')
            ->orderBy('freight_audits.id', 'DESC');

        if ($status !== '') {
            $builder->where('freight_audits.status_auditoria', $status);
        }

        if ($dateFrom !== '') {
            $builder->where('freight_audits.data_auditoria >=', $dateFrom . ' 00:00:00');
        }

        if ($dateTo !== '') {
            $builder->where('freight_audits.data_auditoria <=', $dateTo . ' 23:59:59');
        }

        if ($search !== '') {
            $builder->groupStart()
                ->like('transport_documents.numero_ot', $search)
                ->orLike('carriers.razao_social', $search)
                ->orLike('freight_audits.auditado_por', $search)
                ->groupEnd();
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->audits->pager;

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
                'data_inicio' => $dateFrom,
                'data_fim' => $dateTo,
                'search' => $search,
            ],
            'statusOptions' => self::STATUSES,
        ], 'Auditorias de frete carregadas com sucesso.');
    }

    public function options()
    {
        $this->requirePermission('freight_audits.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            'statusOptions' => self::STATUSES,
            'transport_documents' => $this->transportDocuments
                ->select('id, numero_ot, valor_frete_contratado, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
        ], 'Opcoes da auditoria carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('freight_audits.view');
        $audit = $this->findAuditOrFail($id);

        return $this->respondSuccess([
            ...$audit,
            'summary' => $this->buildSummary((int) $audit['company_id'], (int) $audit['ordem_transporte_id']),
            'statusOptions' => self::STATUSES,
        ], 'Auditoria carregada com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('freight_audits.create');
        return $this->persist();
    }

    public function update(int $id)
    {
        $this->requirePermission('freight_audits.update');
        return $this->persist($id);
    }

    private function persist(?int $id = null)
    {
        $payload = $this->request->getJSON(true) ?? [];

        if (! $this->validateData($payload, FreightAuditValidation::rules())) {
            return $this->respondError('Nao foi possivel salvar a auditoria.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $transportDocumentId = (int) ($payload['ordem_transporte_id'] ?? 0);
        $transportDocument = $this->transportDocuments->where('company_id', $companyId)->find($transportDocumentId);

        if ($transportDocument === null) {
            return $this->respondError('Nao foi possivel salvar a auditoria.', [
                'ordem_transporte_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ], 422);
        }

        $existing = $id ? $this->findAuditOrFail($id) : null;

        if (! $existing) {
            $duplicate = $this->audits
                ->where('company_id', $companyId)
                ->where('ordem_transporte_id', $transportDocumentId)
                ->first();

            if ($duplicate) {
                return $this->respondError('Nao foi possivel salvar a auditoria.', [
                    'ordem_transporte_id' => 'Ja existe auditoria cadastrada para esta ordem de transporte.',
                ], 422);
            }
        }

        $user = $this->authContext->getUser();
        $valorContratado = (float) ($payload['valor_contratado'] ?? 0);
        $valorCte = $payload['valor_cte'] === '' || $payload['valor_cte'] === null ? null : (float) $payload['valor_cte'];
        $valorCobrado = (float) ($payload['valor_cobrado'] ?? 0);

        $data = [
            'company_id' => $companyId,
            'ordem_transporte_id' => $transportDocumentId,
            'valor_contratado' => $valorContratado,
            'valor_cte' => $valorCte,
            'valor_cobrado' => $valorCobrado,
            'diferenca_valor' => round($valorCobrado - $valorContratado, 2),
            'status_auditoria' => trim((string) ($payload['status_auditoria'] ?? 'pendente')),
            'observacoes' => trim((string) ($payload['observacoes'] ?? '')) ?: null,
            'auditado_por' => $existing['auditado_por'] ?? ($user['name'] ?? $user['email'] ?? 'Sistema'),
            'data_auditoria' => trim((string) ($payload['data_auditoria'] ?? '')),
        ];

        if ($existing) {
            $this->audits->update($id, $data);
            $auditId = $id;
        } else {
            $this->audits->insert($data);
            $auditId = (int) $this->audits->getInsertID();
        }

        return $this->respondSuccess(
            [
                ...$this->findAuditOrFail($auditId),
                'summary' => $this->buildSummary($companyId, $transportDocumentId),
            ],
            $existing ? 'Auditoria atualizada com sucesso.' : 'Auditoria criada com sucesso.',
            $existing ? 200 : 201
        );
    }

    private function findAuditOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $audit = $this->audits
            ->select('freight_audits.*, transport_documents.numero_ot, transport_documents.valor_frete_contratado, transport_documents.status as ordem_status, carriers.razao_social as transporter_name')
            ->join('transport_documents', 'transport_documents.id = freight_audits.ordem_transporte_id')
            ->join('carriers', 'carriers.id = transport_documents.transporter_id')
            ->where('freight_audits.company_id', $companyId)
            ->find($id);

        if ($audit === null) {
            throw PageNotFoundException::forPageNotFound('Auditoria de frete nao encontrada.');
        }

        return $audit;
    }

    private function buildSummary(int $companyId, int $transportDocumentId): array
    {
        $cteDocuments = $this->tripDocuments
            ->select('id, numero_documento, nome_arquivo_original, created_at')
            ->where('company_id', $companyId)
            ->where('ordem_transporte_id', $transportDocumentId)
            ->where('tipo_documento', 'CTe')
            ->orderBy('id', 'DESC')
            ->findAll();

        $proofOfDelivery = $this->deliveryReceipts
            ->select('id, data_entrega_real, nome_recebedor, nome_arquivo_original')
            ->where('company_id', $companyId)
            ->where('ordem_transporte_id', $transportDocumentId)
            ->first();

        return [
            'cte_documents' => $cteDocuments,
            'proof_of_delivery' => $proofOfDelivery,
            'cte_count' => count($cteDocuments),
            'has_proof_of_delivery' => $proofOfDelivery !== null,
        ];
    }
}
