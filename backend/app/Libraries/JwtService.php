<?php

namespace App\Libraries;

use CodeIgniter\I18n\Time;
use Config\TmsAuth;
use RuntimeException;

class JwtService
{
    public function __construct(private readonly TmsAuth $config)
    {
    }

    public function generateAccessToken(array $payload): string
    {
        $now = Time::now()->getTimestamp();

        $claims = array_merge($payload, [
            'iss' => $this->config->jwtIssuer,
            'aud' => $this->config->jwtAudience,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $this->config->accessTokenTtl,
        ]);

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $segments = [
            $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
            $this->base64UrlEncode(json_encode($claims, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $this->config->jwtSecret, true);
        $segments[] = $this->base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public function parse(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new RuntimeException('Token JWT invalido.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $header = json_decode($this->base64UrlDecode($encodedHeader), true);
        $payload = json_decode($this->base64UrlDecode($encodedPayload), true);

        if (! is_array($header) || ! is_array($payload) || ($header['alg'] ?? null) !== 'HS256') {
            throw new RuntimeException('Token JWT invalido.');
        }

        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $this->config->jwtSecret, true),
        );

        if (! hash_equals($expectedSignature, $encodedSignature)) {
            throw new RuntimeException('Assinatura JWT invalida.');
        }

        $now = Time::now()->getTimestamp();

        if (($payload['iss'] ?? null) !== $this->config->jwtIssuer) {
            throw new RuntimeException('Issuer JWT invalido.');
        }

        if (($payload['aud'] ?? null) !== $this->config->jwtAudience) {
            throw new RuntimeException('Audience JWT invalida.');
        }

        if (($payload['nbf'] ?? 0) > $now || ($payload['exp'] ?? 0) < $now) {
            throw new RuntimeException('Token JWT expirado ou indisponivel.');
        }

        return $payload;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;

        if ($remainder !== 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
