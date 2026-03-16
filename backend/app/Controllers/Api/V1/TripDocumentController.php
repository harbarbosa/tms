<?php

namespace App\Controllers\Api\V1;

use App\Models\TripDocumentModel;
use App\Models\TransportDocumentModel;
use App\Services\SystemCatalogService;
use App\Traits\HandlesApiUploads;
use App\Validation\LogisticsDocumentValidation;
use CodeIgniter\Exceptions\PageNotFoundException;

class TripDocumentController extends BaseApiController
{
    use HandlesApiUploads;

    private const TYPES = ['CTe', 'MDFe', 'Nota Fiscal', 'Comprovante de Entrega', 'Outros'];

    private TransportDocumentModel $transportDocuments;

    private SystemCatalogService $catalogService;

    public function __construct(private readonly TripDocumentModel $documents = new TripDocumentModel())
    {
        $this->transportDocuments = new TransportDocumentModel();
        $this->catalogService = new SystemCatalogService();
    }

    public function index()
    {
        $this->requirePermission('trip_documents.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        [$page, $perPage] = $this->getPaginationParams();
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $type = trim((string) ($this->request->getGet('tipo_documento') ?? ''));
        $transportDocumentId = (int) ($this->request->getGet('ordem_transporte_id') ?? 0);

        $builder = $this->documents
            ->select('trip_documents.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = trip_documents.ordem_transporte_id')
            ->where('trip_documents.company_id', $companyId)
            ->orderBy('trip_documents.id', 'DESC');

        $this->applyOwnedTripScope($builder);

        if ($search !== '') {
            $builder->groupStart()
                ->like('trip_documents.numero_documento', $search)
                ->orLike('trip_documents.nome_arquivo_original', $search)
                ->orLike('transport_documents.numero_ot', $search)
                ->groupEnd();
        }

        if ($type !== '') {
            $builder->where('trip_documents.tipo_documento', $type);
        }

        if ($transportDocumentId > 0) {
            $builder->where('trip_documents.ordem_transporte_id', $transportDocumentId);
        }

        $total = $builder->countAllResults(false);
        $items = $builder->paginate($perPage, 'default', $page);
        $pager = $this->documents->pager;

        return $this->respondPaginated(
            $items,
            $page,
            $perPage,
            $total,
            $pager->getPageCount(),
            [
                'search' => $search,
                'tipo_documento' => $type,
                'ordem_transporte_id' => $transportDocumentId > 0 ? $transportDocumentId : null,
            ],
            ['typeOptions' => self::TYPES],
            'Documentos da viagem carregados com sucesso.'
        );
    }

    public function options()
    {
        $this->requirePermission('trip_documents.view');
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $transportDocuments = $this->transportDocuments
            ->select('transport_documents.id, transport_documents.numero_ot, transport_documents.status')
            ->where('transport_documents.company_id', $companyId)
            ->orderBy('transport_documents.id', 'DESC');

        $this->applyOwnedTransportDocumentScope($transportDocuments);
        $typeOptions = array_map(
            static fn (array $item): string => $item['label'],
            $this->catalogService->getCatalogItems($companyId, 'document_types')
        );

        return $this->respondSuccess([
            'typeOptions' => $typeOptions,
            'transport_documents' => $transportDocuments->findAll(),
        ], 'Opcoes dos documentos carregadas com sucesso.');
    }

    public function show(int $id)
    {
        $this->requirePermission('trip_documents.view');
        return $this->respondSuccess($this->findDocumentOrFail($id), 'Documento carregado com sucesso.');
    }

    public function create()
    {
        $this->requirePermission('trip_documents.create');
        $payload = $this->request->getPost();

        if (! $this->validateData($payload, LogisticsDocumentValidation::tripDocumentRules())) {
            return $this->respondValidationError('Nao foi possivel enviar o documento.', $this->validator->getErrors());
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $transportDocumentId = (int) ($payload['ordem_transporte_id'] ?? 0);

        if ($this->findOwnedTransportDocument($transportDocumentId, $companyId) === null) {
            return $this->respondValidationError('Nao foi possivel enviar o documento.', [
                'ordem_transporte_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ]);
        }

        $file = $this->request->getFile('arquivo');
        $upload = $this->storeUploadedFile($file, $companyId, 'trip-documents');

        if ($upload['errors'] !== []) {
            return $this->respondValidationError('Nao foi possivel enviar o documento.', $upload['errors']);
        }

        $user = $this->authContext->getUser();

        $this->documents->insert([
            'company_id' => $companyId,
            'ordem_transporte_id' => $transportDocumentId,
            'tipo_documento' => trim((string) ($payload['tipo_documento'] ?? '')),
            'numero_documento' => trim((string) ($payload['numero_documento'] ?? '')) ?: null,
            'arquivo' => $upload['path'],
            'nome_arquivo_original' => $upload['originalName'],
            'mime_type' => $upload['mimeType'],
            'tamanho_arquivo' => $upload['size'],
            'observacoes' => trim((string) ($payload['observacoes'] ?? '')) ?: null,
            'enviado_por' => $user['name'] ?? $user['email'] ?? 'Sistema',
        ]);

        return $this->respondSuccess(
            $this->findDocumentOrFail((int) $this->documents->getInsertID()),
            'Documento enviado com sucesso.',
            201
        );
    }

    public function delete(int $id)
    {
        $this->requirePermission('trip_documents.delete');
        $document = $this->findDocumentOrFail($id);
        $this->removeFileIfExists($document['arquivo'] ?? null);
        $this->documents->delete($id);

        return $this->respondSuccess(null, 'Documento removido com sucesso.');
    }

    public function view(int $id)
    {
        $this->requirePermission('trip_documents.view');
        $document = $this->findDocumentOrFail($id);
        $absolutePath = WRITEPATH . $document['arquivo'];

        if (! is_file($absolutePath)) {
            throw PageNotFoundException::forPageNotFound('Arquivo nao encontrado.');
        }

        return $this->response
            ->setHeader('Content-Type', $document['mime_type'] ?: 'application/octet-stream')
            ->setHeader('X-Content-Type-Options', 'nosniff')
            ->setHeader('Content-Disposition', 'inline; filename="' . addslashes($document['nome_arquivo_original']) . '"')
            ->setHeader('Content-Length', (string) filesize($absolutePath))
            ->setBody((string) file_get_contents($absolutePath));
    }

    private function findDocumentOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $builder = $this->documents
            ->select('trip_documents.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = trip_documents.ordem_transporte_id')
            ->where('trip_documents.company_id', $companyId)
            ->where('trip_documents.id', $id);

        $this->applyOwnedTripScope($builder);
        $document = $builder->first();

        if ($document === null) {
            throw PageNotFoundException::forPageNotFound('Documento da viagem nao encontrado.');
        }

        return $document;
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
