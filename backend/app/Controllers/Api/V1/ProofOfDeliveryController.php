<?php

namespace App\Controllers\Api\V1;

use App\Models\DeliveryReceiptModel;
use App\Models\TransportDocumentModel;
use App\Validation\LogisticsDocumentValidation;
use CodeIgniter\Exceptions\PageNotFoundException;
use CodeIgniter\HTTP\Files\UploadedFile;

class ProofOfDeliveryController extends BaseApiController
{
    private TransportDocumentModel $transportDocuments;

    public function __construct(private readonly DeliveryReceiptModel $receipts = new DeliveryReceiptModel())
    {
        $this->transportDocuments = new TransportDocumentModel();
    }

    public function index()
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(50, max(5, (int) ($this->request->getGet('perPage') ?? 10)));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $transportDocumentId = (int) ($this->request->getGet('ordem_transporte_id') ?? 0);

        $builder = $this->receipts
            ->select('delivery_receipts.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->where('delivery_receipts.company_id', $companyId)
            ->orderBy('delivery_receipts.id', 'DESC');

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
                'ordem_transporte_id' => $transportDocumentId > 0 ? $transportDocumentId : null,
            ],
        ], 'Comprovantes de entrega carregados com sucesso.');
    }

    public function options()
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);

        return $this->respondSuccess([
            'transport_documents' => $this->transportDocuments
                ->select('id, numero_ot, status')
                ->where('company_id', $companyId)
                ->orderBy('id', 'DESC')
                ->findAll(),
        ], 'Opcoes do comprovante carregadas com sucesso.');
    }

    public function show(int $id)
    {
        return $this->respondSuccess($this->findReceiptOrFail($id), 'Comprovante carregado com sucesso.');
    }

    public function create()
    {
        return $this->persist();
    }

    public function update(int $id)
    {
        return $this->persist($id);
    }

    public function view(int $id)
    {
        $receipt = $this->findReceiptOrFail($id);
        $absolutePath = WRITEPATH . $receipt['arquivo_comprovante'];

        if (! is_file($absolutePath)) {
            throw PageNotFoundException::forPageNotFound('Arquivo do comprovante nao encontrado.');
        }

        return $this->response
            ->setHeader('Content-Type', $receipt['mime_type'] ?: 'application/octet-stream')
            ->setHeader('Content-Disposition', 'inline; filename="' . addslashes($receipt['nome_arquivo_original']) . '"')
            ->setBody((string) file_get_contents($absolutePath));
    }

    private function persist(?int $id = null)
    {
        $payload = $this->request->getPost();

        if (! $this->validateData($payload, LogisticsDocumentValidation::deliveryReceiptRules())) {
            return $this->respondError('Nao foi possivel salvar o comprovante.', $this->validator->getErrors(), 422);
        }

        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $transportDocumentId = (int) ($payload['ordem_transporte_id'] ?? 0);

        if (! $this->transportDocuments->where('company_id', $companyId)->find($transportDocumentId)) {
            return $this->respondError('Nao foi possivel salvar o comprovante.', [
                'ordem_transporte_id' => 'A ordem de transporte informada nao pertence a empresa atual.',
            ], 422);
        }

        $existing = $id ? $this->findReceiptOrFail($id) : null;
        $file = $this->request->getFile('arquivo_comprovante');
        $upload = $this->storeUploadedFile($file, $companyId, 'proof-of-deliveries', $existing !== null);

        if ($upload['errors'] !== []) {
            return $this->respondError('Nao foi possivel salvar o comprovante.', $upload['errors'], 422);
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
            return $this->respondError('Nao foi possivel salvar o comprovante.', [
                'arquivo_comprovante' => 'Selecione um arquivo valido.',
            ], 422);
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
                return $this->respondError('Nao foi possivel salvar o comprovante.', [
                    'ordem_transporte_id' => 'Ja existe comprovante cadastrado para esta ordem de transporte.',
                ], 422);
            }

            $this->receipts->insert($data);
            $receiptId = (int) $this->receipts->getInsertID();
        }

        $this->transportDocuments->where('company_id', $companyId)->update($transportDocumentId, ['status' => 'finalizada']);

        return $this->respondSuccess($this->findReceiptOrFail($receiptId), $existing ? 'Comprovante atualizado com sucesso.' : 'Comprovante criado com sucesso.', $existing ? 200 : 201);
    }

    private function findReceiptOrFail(int $id): array
    {
        $companyId = (int) ($this->authContext->getCompany()['id'] ?? 0);
        $receipt = $this->receipts
            ->select('delivery_receipts.*, transport_documents.numero_ot')
            ->join('transport_documents', 'transport_documents.id = delivery_receipts.ordem_transporte_id')
            ->where('delivery_receipts.company_id', $companyId)
            ->find($id);

        if ($receipt === null) {
            throw PageNotFoundException::forPageNotFound('Comprovante de entrega nao encontrado.');
        }

        return $receipt;
    }

    private function storeUploadedFile(?UploadedFile $file, int $companyId, string $folder, bool $optional = false): array
    {
        if ((! $file || ! $file->isValid()) && $optional) {
            return ['errors' => [], 'path' => null];
        }

        if (! $file || ! $file->isValid()) {
            return ['errors' => ['arquivo_comprovante' => 'Selecione um arquivo valido.']];
        }

        $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        $extension = strtolower($file->getExtension() ?: '');

        if (! in_array($extension, $allowedExtensions, true)) {
            return ['errors' => ['arquivo_comprovante' => 'Envie arquivos PDF, JPG, JPEG ou PNG.']];
        }

        if ($file->getSizeByUnit('kb') > 5120) {
            return ['errors' => ['arquivo_comprovante' => 'O arquivo deve ter no maximo 5MB.']];
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
