<?php

namespace App\Helper;

use App\Models\Log\AuditLog;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class HelperFunction
{
    private const CIPHER = 'aes-256-gcm';
    private const IV_LENGTH = 12;
    private const TAG_LENGTH = 16;

    /**
     * -------------------------------------------------------------
     * 🔐 ENCRYPT (SIMPLE GCM - DIRECT)
     * -------------------------------------------------------------
     */
    public static function encrypt($data): string
    {
        try {
            // simple key (no salt, no pbkdf2)
            $key = hash('sha256', config('app.client_secret'), true);

            $iv = random_bytes(self::IV_LENGTH);
            $tag = '';

            $plaintext = is_string($data)
                ? $data
                : json_encode($data, JSON_UNESCAPED_UNICODE);

            $ciphertext = openssl_encrypt(
                $plaintext,
                self::CIPHER,
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag,
                '',
                self::TAG_LENGTH
            );

            if ($ciphertext === false) {
                throw new Exception('Encryption failed');
            }

            return base64_encode($iv . $tag . $ciphertext);

        } catch (Exception $e) {
            Log::error('Encryption failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * -------------------------------------------------------------
     * 🔓 DECRYPT (SIMPLE GCM - DIRECT)
     * -------------------------------------------------------------
     */
    public static function decrypt(string $payload)
    {
        try {
            $decoded = base64_decode($payload, true);

            if ($decoded === false) {
                throw new Exception('Invalid payload');
            }

            $key = hash('sha256', config('app.client_secret'), true);

            $iv = substr($decoded, 0, self::IV_LENGTH);
            $tag = substr($decoded, self::IV_LENGTH, self::TAG_LENGTH);
            $ciphertext = substr($decoded, self::IV_LENGTH + self::TAG_LENGTH);

            $decrypted = openssl_decrypt(
                $ciphertext,
                self::CIPHER,
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag
            );

            if ($decrypted === false) {
                throw new Exception('Decryption failed');
            }

            $json = json_decode($decrypted, true);

            return json_last_error() === JSON_ERROR_NONE
                ? $json
                : $decrypted;

        } catch (Exception $e) {
            Log::error('Decryption failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * -------------------------------------------------------------
     * 📦 RESPONSE (ENCRYPTED)
     * -------------------------------------------------------------
     */
    public static function response(
        $data = null,
        string $message = 'OK',
        string $status = 'success',
        string $code = '000',
        int $httpCode = 200
    ) {
        try {
            $response = [
                'status'  => $status,
                'code'    => $code,
                'message' => $message,
            ];

            if ($status === 'success') {
                $response['data'] = $data;
            } else {
                $response['error'] = $data;
            }

            return response()->json($response, $httpCode);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'code'    => '500',
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    /**
     * -------------------------------------------------------------
     * 📝 AUDIT LOG
     * -------------------------------------------------------------
     */
    public static function log(
        string $action,
        string $message,
        string $status,
        $request = null,
        array $data = []
    ): void {
        try {
            AuditLog::create([
                'client_id'  => config('app.client_id'),
                'user_id'    => Auth::id(),
                'module'     => 1,
                'action'     => $action,
                'message'    => $message,
                'status'     => $status,
                'ip_address' => $request?->ip(),
                'new_value'  => !empty($data) ? json_encode($data) : null,
            ]);

        } catch (Exception $e) {
            Log::error('Audit log failed', [
                'error' => $e->getMessage(),
                'action' => $action
            ]);
        }
    }
}