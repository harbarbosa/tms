<?php

namespace App\Traits;

use CodeIgniter\HTTP\Files\UploadedFile;
use Config\Mimes;

trait HandlesApiUploads
{
    protected function storeUploadedFile(
        ?UploadedFile $file,
        int $companyId,
        string $folder,
        bool $optional = false,
        string $field = 'arquivo',
        int $maxKilobytes = 5120,
        array $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'],
        array $allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']
    ): array {
        if ((! $file || ! $file->isValid()) && $optional) {
            return ['errors' => [], 'path' => null];
        }

        if (! $file || ! $file->isValid()) {
            return ['errors' => [$field => 'Selecione um arquivo valido.']];
        }

        $extension = strtolower($file->getExtension() ?: '');
        if (! in_array($extension, $allowedExtensions, true)) {
            return ['errors' => [$field => 'Formato de arquivo nao permitido.']];
        }

        if ($file->getSizeByUnit('kb') > $maxKilobytes) {
            return ['errors' => [$field => sprintf('O arquivo deve ter no maximo %dMB.', (int) floor($maxKilobytes / 1024))]];
        }

        $realMimeType = $file->getMimeType();
        $clientMimeType = $file->getClientMimeType();
        if (
            ! in_array($realMimeType, $allowedMimeTypes, true)
            || ($clientMimeType && ! in_array($clientMimeType, $allowedMimeTypes, true))
        ) {
            return ['errors' => [$field => 'O tipo real do arquivo nao e permitido.']];
        }

        $mimes = new Mimes();
        $expectedMimeTypes = (array) ($mimes->guessTypeFromExtension($extension) ?? []);

        if ($expectedMimeTypes !== [] && ! in_array($realMimeType, $expectedMimeTypes, true)) {
            return ['errors' => [$field => 'O arquivo informado nao corresponde a extensao enviada.']];
        }

        $relativeFolder = 'uploads/' . trim($folder, '/') . '/company-' . $companyId;
        $absoluteFolder = WRITEPATH . $relativeFolder;

        if (! is_dir($absoluteFolder) && ! mkdir($absoluteFolder, 0755, true) && ! is_dir($absoluteFolder)) {
            return ['errors' => [$field => 'Nao foi possivel preparar o diretorio de upload.']];
        }

        $randomName = $file->getRandomName();
        $file->move($absoluteFolder, $randomName);

        return [
            'errors' => [],
            'path' => $relativeFolder . '/' . $randomName,
            'originalName' => basename($file->getClientName()),
            'mimeType' => $realMimeType,
            'size' => $file->getSize(),
        ];
    }

    protected function removeFileIfExists(?string $relativePath): void
    {
        if (! $relativePath) {
            return;
        }

        $absolutePath = WRITEPATH . ltrim($relativePath, '/\\');

        if (is_file($absolutePath)) {
            @unlink($absolutePath);
        }
    }
}
