<?php

namespace App\Controllers\Api\V1;

use App\Models\DeliveryReceiptModel;
use App\Models\LoadModel;
use App\Models\TrackingEventModel;
use App\Models\TransportDocumentModel;
use App\Models\TransportOrderModel;
use App\Traits\HandlesApiUploads;
use App\Validation\LogisticsDocumentValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class ProofOfDeliveryController extends BaseApiController
{
    use HandlesApiUploads;

    private TransportDocumentModel $transportDocuments;

    private TrackingEventModel $trackingEvents;

    private TransportOrderModel $orders;

    private LoadModel $loads;

    public function __construct(private readonly DeliveryReceiptModel $receipts = new DeliveryReceiptModel())
    {
        $this->transportDocuments = new TransportDocumentModel();
        $this->trackingEvents = new TrackingEventModel();
        $this->orders = new TransportOrderModel();
        $this->loads = new LoadModel();
    }

    public function index()
    {
        $this->requirePermission('proof_of_deliveries.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        [$page, $perPage] = $this->getPaginationParams();
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $transportDocumentId = (int) ($this->request->getGet('ordem_transporte_id') ?? 0);

        $builder = $this->receipts
            ->select('delivery_receipts.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->where('delivery_receipts.company_id', $companyId)
            ->orderBy('delivery_receipts.id', 'DESC');

        $this->applyOwnedTripScope($builder);

        if ($search !== '') {
            $builder->groupStart()
                ->like('transport_documents.numero_ot', $search)
                ->orLike('delivery_receipts.nome_recebedor', $search)
                ->orLike('delivery_receipts.documento_recebedor', $search)
                ->groupEnd();
        }

        if ($transportDocumentId > 0) {
            $builder->where('delivery_receipts.ordem_transporte_id', $transportDocumentId);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->receipts->pager;

        return $this->respondPaginated(
            $items,
            $page,
            $perPage,
            $total,
            $pager->getPageCount(),
            [
                'search' => $search,
                'ordem_transporte_id' => $transportDocumentId > 0 ? $transportDocumentId : null,
            ],
            [],
            'Comprovantes de entrega carregados com sucesso.'
        );
    }

    public function options()
    {
        $this->requirePermission('proof_of_deliveries.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        $transportDocuments = $this->transportDocuments
            ->select('transport_documents.id, transport_documents.numero_ot, transport_documents.status')
            ->where('transport_documents.company_id', $companyId)
            ->orderBy('transport_documents.id', 'DESC');

        $this->applyOwnedTransportDocumentScope($transportDocuments);

        return $this->respondSuccess([
            'transport_documents' => $transportDocuments->findAll(),
        ], 'Opcoes do comprovante carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('proof_of_deliveries.view');
        return $this->respondSuccess($this->findReceiptOrFail($id), 'Comprovante carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('proof_of_deliveries.create');
        return $this->persist();
    }

    public function update(int $id)
    {
        $this->requirePermission('proof_of_deliveries.update');
        return $this->persist($id);
    }

    public function view(int $id)
    {
        $this->requirePermission('proof_of_deliveries.view');
        $receipt = $this->findReceiptOrFail($id);
        $absolutePath = WRITEPATH . $receipt['arquivo_comprovante'];

        if (! is_file($absolutePath)) {
            throw PageNotFoundException::forPageNotFound('Arquivo do comprovante nao encontrado.');
        }

        return $this->response
            ->setHeader('Content-Type', $receipt['mime_type'] ?: 'application/octet-stream')
            ->setHeader('X-Content-Type-Options', 'nosniff')
            ->setHeader('Content-Disposition', 'inline; filename="' . addslashes($receipt['nome_arquivo_original']) . '"')
            ->setHeader('Content-Length', (string) filesize($absolutePath))
            ->setBody((string) file_get_contents($absolutePath));
    }

    private function persist(?int $id = null)
    {
        $payload = $this->request->getPost();

        if (! $this->validateData($payload, LogisticsDocumentValidation::deliveryReceiptRules())) {
            return $this->respondValidationError('Nao foi possivel salvar o comprovante.', $this->validator->getErrors());
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $transportDocumentId = (int) ($payload['ordem_transporte_id'] ?? 0);

        $transportDocument = $this->findOwnedTransportDocument($transportDocumentId, $companyId);

        if (! $transportDocument) {
            return $this->respondValidationError('Nao foi possivel salvar o comprovante.', [
                'ordem_transporte_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ]);
        }

        $existing = $id ? $this->findReceiptOrFail($id) : null;
        $file = $this->request->getFile('arquivo_comprovante');
        $upload = $this->storeUploadedFile($file, $companyId, 'proof-of-deliveries', $existing !== null, 'arquivo_comprovante');

        if ($upload['errors'] !== []) {
            return $this->respondValidationError('Nao foi possivel salvar o comprovante.', $upload['errors']);
        }

        $data = [
            'company_id' => $companyId,
            'ordem_transporte_id' => $transportDocumentId,
            'data_entrega_real' => trim((string) ($payload['data_entrega_real'] ?? '')),
            'nome_recebedor' => trim((string) ($payload['nome_recebedor'] ?? '')),
            'documento_recebedor' => trim((string) ($payload['documento_recebedor'] ?? '')) ?: null,
            'observacoes_entrega' => trim((string) ($payload['observacoes_entrega'] ?? '')) ?: null,
        ];

        if ($upload['path']) {
            if ($existing) {
                $this->removeFileIfExists($existing['arquivo_comprovante'] ?? null);
            }

            $data['arquivo_comprovante'] = $upload['path'];
            $data['nome_arquivo_original'] = $upload['originalName'];
            $data['mime_type'] = $upload['mimeType'];
            $data['tamanho_arquivo'] = $upload['size'];
        } elseif (! $existing) {
            return $this->respondValidationError('Nao foi possivel salvar o comprovante.', [
                'arquivo_comprovante' => 'Selecione um arquivo valido.',
            ]);
        }

        if ($existing) {
            $this->receipts->update($id, $data);
            $receiptId = $id;
        } else {
            $duplicate = $this->receipts
                ->where('company_id', $companyId)
                ->where('ordem_transporte_id', $transportDocumentId)
                ->first();

            if ($duplicate) {
                return $this->respondValidationError('Nao foi possivel salvar o comprovante.', [
                    'ordem_transporte_id' => 'Ja existe comprovante cadastrado para esta ordem de transporte.',
                ]);
            }

            $this->receipts->insert($data);
            $receiptId = (int) $this->receipts->getInsertID();
        }

        $this->transportDocuments->where('company_id', $companyId)->update($transportDocumentId, ['status' => 'finalizada']);
        $this->syncDeliveryCompletion($transportDocument, $companyId, trim((string) ($payload['data_entrega_real'] ?? '')), $data['observacoes_entrega']);

        return $this->respondSuccess($this->findReceiptOrFail($receiptId), $existing ? 'Comprovante atualizado com sucesso.' : 'Comprovante criado com sucesso.', $existing ? 200 : 201);
    }

    private function syncDeliveryCompletion(array $transportDocument, int $companyId, string $deliveryAt, ?string $notes): void
    {
        $latestEvent = $this->trackingEvents
            ->where('transport_document_id', (int) $transportDocument['id'])
            ->orderBy('event_at', 'DESC')
            ->orderBy('id', 'DESC')
            ->first();

        if (($latestEvent['status'] ?? null) !== 'entregue') {
            $this->trackingEvents->insert([
                'company_id' => $companyId,
                'transport_document_id' => (int) $transportDocument['id'],
                'status' => 'entregue',
                'event_at' => $deliveryAt,
                'observacoes' => $notes ?: 'Entrega confirmada via comprovante de entrega.',
                'attachment_path' => null,
            ]);
        }

        if (! empty($transportDocument['pedido_id'])) {
            $this->orders->where('company_id', $companyId)->update((int) $transportDocument['pedido_id'], ['status' => 'entregue']);
        }

        if (! empty($transportDocument['carga_id'])) {
            $this->loads->where('company_id', $companyId)->update((int) $transportDocument['carga_id'], ['status' => 'entregue']);
        }
    }

    private function findReceiptOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->receipts
            ->select('delivery_receipts.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->where('delivery_receipts.company_id', $companyId)
            ->where('delivery_receipts.id', $id);

        $this->applyOwnedTripScope($builder);
        $receipt = $builder->first();

        if ($receipt === null) {
            throw PageNotFoundException::forPageNotFound('Comprovante de entrega nao encontrado.');
        }

        return $receipt;
    }

    private function applyOwnedTripScope($builder): void
    {
        $role = $this->getCurrentRole();
        $scope = $this->getCurrentScope();

        if ($role === 'carrier') {
            $builder->where('transport_documents.transporter_id', (int) ($scope['carrier_id'] ?? 0));
        }

        if ($role === 'driver') {
            $builder->where('transport_documents.driver_id', (int) ($scope['driver_id'] ?? 0));
        }
    }

    private function applyOwnedTransportDocumentScope($builder): void
    {
        $role = $this->getCurrentRole();
        $scope = $this->getCurrentScope();

        if ($role === 'carrier') {
            $builder->where('transport_documents.transporter_id', (int) ($scope['carrier_id'] ?? 0));
        }

        if ($role === 'driver') {
            $builder->where('transport_documents.driver_id', (int) ($scope['driver_id'] ?? 0));
        }
    }

    private function findOwnedTransportDocument(int $id, int $companyId): ?array
    {
        $builder = $this->transportDocuments
            ->select('transport_documents.*')
            ->where('transport_documents.company_id', $companyId)
            ->where('transport_documents.id', $id);

        $this->applyOwnedTransportDocumentScope($builder);

        return $builder->first();
    }
}
