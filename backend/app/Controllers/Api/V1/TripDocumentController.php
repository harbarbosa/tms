<?php

namespace App\Controllers\Api\V1;

use App\Models\TripDocumentModel;
use App\Models\TransportDocumentModel;
use App\Validation\LogisticsDocumentValidation;
use CodeIgniter\Exceptions\PageNotFoundException;
use CodeIgniter\HTTP\Files\UploadedFile;

class TripDocumentController extends BaseApiController
{
    private const TYPES = ['CTe', 'MDFe', 'Nota Fiscal', 'Comprovante de Entrega', 'Outros'];

    private TransportDocumentModel $transportDocuments;

    public function __construct(private readonly TripDocumentModel $documents = new TripDocumentModel())
    {
        $this->transportDocuments = new TransportDocumentModel();
    }

    public function index()
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $type = trim((string) ($this->request->getGet('tipo_documento') ?? ''));
        $transportDocumentId = (int) ($this->request->getGet('ordem_transporte_id') ?? 0);

        $builder = $this->documents
            ->select('trip_documents.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = trip_documents.ordem_transporte_id')
            ->where('trip_documents.company_id', $companyId)
            ->orderBy('trip_documents.id', 'DESC');

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
                'tipo_documento' => $type,
                'ordem_transporte_id' => $transportDocumentId > 0 ? $transportDocumentId : null,
            ],
            'typeOptions' => self::TYPES,
        ], 'Documentos da viagem carregados com sucesso.');
    }

    public function options()
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            'typeOptions' => self::TYPES,
            'transport_documents' => $this->transportDocuments
                ->select('id, numero_ot, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
        ], 'Opcoes dos documentos carregadas com sucesso.');
    }

    public function show(int $id)
    {
        return $this->respondSuccess($this->findDocumentOrFail($id), 'Documento carregado com sucesso.');
    }

    public function create()
    {
        $payload = $this->request->getPost();

        if (! $this->validateData($payload, LogisticsDocumentValidation::tripDocumentRules())) {
            return $this->respondError('Nao foi possivel enviar o documento.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $transportDocumentId = (int) ($payload['ordem_transporte_id'] ?? 0);

        if (! $this->transportDocuments->where('company_id', $companyId)->find($transportDocumentId)) {
            return $this->respondError('Nao foi possivel enviar o documento.', [
                'ordem_transporte_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ], 422);
        }

        $file = $this->request->getFile('arquivo');
        $upload = $this->storeUploadedFile($file, $companyId, 'trip-documents');

        if ($upload['errors'] !== []) {
            return $this->respondError('Nao foi possivel enviar o documento.', $upload['errors'], 422);
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
        $document = $this->findDocumentOrFail($id);
        $this->removeFileIfExists($document['arquivo'] ?? null);
        $this->documents->delete($id);

        return $this->respondSuccess(null, 'Documento removido com sucesso.');
    }

    public function view(int $id)
    {
        $document = $this->findDocumentOrFail($id);
        $absolutePath = WRITEPATH . $document['arquivo'];

        if (! is_file($absolutePath)) {
            throw PageNotFoundException::forPageNotFound('Arquivo nao encontrado.');
        }

        return $this->response
            ->setHeader('Content-Type', $document['mime_type'] ?: 'application/octet-stream')
            ->setHeader('Content-Disposition', 'inline; filename="' . addslashes($document['nome_arquivo_original']) . '"')
            ->setBody((string) file_get_contents($absolutePath));
    }

    private function findDocumentOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $document = $this->documents
            ->select('trip_documents.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = trip_documents.ordem_transporte_id')
            ->where('trip_documents.company_id', $companyId)
            ->find($id);

        if ($document === null) {
            throw PageNotFoundException::forPageNotFound('Documento da viagem nao encontrado.');
        }

        return $document;
    }

    private function storeUploadedFile(?UploadedFile $file, int $companyId, string $folder): array
    {
        $errors = [];

        if (! $file || ! $file->isValid()) {
            return ['errors' => ['arquivo' => 'Selecione um arquivo valido.']];
        }

        $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        $extension = strtolower($file->getExtension() ?: '');

        if (! in_array($extension, $allowedExtensions, true)) {
            $errors['arquivo'] = 'Envie arquivos PDF, JPG, JPEG ou PNG.';
        }

        if ($file->getSizeByUnit('kb') > 5120) {
            $errors['arquivo'] = 'O arquivo deve ter no maximo 5MB.';
        }

        if ($errors !== []) {
            return ['errors' => $errors];
        }

        $relativeFolder = 'uploads/' . $folder . '/company-' . $companyId;
        $absoluteFolder = WRITEPATH . $relativeFolder;

        if (! is_dir($absoluteFolder)) {
            mkdir($absoluteFolder, 0777, true);
        }

        $randomName = $file->getRandomName();
        $file->move($absoluteFolder, $randomName);

        return [
            'errors' => [],
            'path' => $relativeFolder . '/' . $randomName,
            'originalName' => $file->getClientName(),
            'mimeType' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ];
    }

    private function removeFileIfExists(?string $relativePath): void
    {
        if (! $relativePath) {
            return;
        }

        $absolutePath = WRITEPATH . $relativePath;

        if (is_file($absolutePath)) {
            unlink($absolutePath);
        }
    }
}
