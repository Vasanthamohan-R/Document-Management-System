<?php

namespace App\Helper;

use App\Models\AuditLog;
use App\Models\Client;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class Helper
{
    public static function log($action, $message, $status, $request = null, $data = [])
    {
        try {
            $dataArray = is_array($data) ? $data : [];

            // ✅ Get hex value from config
            $clientHex = config('app.client_id');

            // ✅ Find the integer ID from clients table using hex value

            $client = Client::where('id', $clientHex)->first();
            $clientId = $client ? $client->id : null;

            Log::info('Client lookup:', [
                'hex' => $clientHex,
                'client_id' => $clientId,
                'found' => $client ? true : false,
            ]);

            $payload = [
                'client_id' => $clientId,
                'user_id' => Auth::id(),
                'module' => 1,
                'action' => $action,
                'message' => $message,
                'status' => $status,
                'ip_address' => $request ? $request->ip() : null,
                'new_value' => ! empty($dataArray) ? json_encode($dataArray) : null,
            ];

            Log::info('AuditLog Payload:', $payload);

            AuditLog::create($payload);

        } catch (Exception $e) {
            Log::error('AuditLog FAILED: '.$e->getMessage(), [
                'action' => $action,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
