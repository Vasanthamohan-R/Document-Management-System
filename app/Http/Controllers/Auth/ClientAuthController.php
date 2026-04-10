<?php

namespace App\Http\Controllers\Auth;

use App\Constants\ResponseCode;
use App\Http\Controllers\Controller;
use App\Models\Auth\Client;
use App\Models\Auth\ClientSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Class ClientAuthController
 *
 * Controller for managing API client authentication.
 * Handles client registration, login, logout, and session management.
 *
 * @author DMS Team
 *
 * @created 2026-03-05
 *
 * @version 1.0
 */
class ClientAuthController extends Controller
{
    /**
     * Client Token Generate API
     *
     * Validates client credentials and generates client token.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function tokenGenerate(Request $request)
    {
        try {

            $validator = Validator::make($request->all(), [
                'client_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Find client
            $client = Client::where('client_id', $request->client_id)->first();

            if (! $client) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::CLIENT_NOT_FOUND,
                    'message' => 'Client not found',
                    'errors' => [],
                ], 404);
            }

            // Generate token
            $plainTextToken = Str::random(60);
            // $hashedToken = Crypt::encryptString($plainTextToken);
            $hashedToken = hash('sha256', $plainTextToken);

            $expiresAt = now()->addMinutes(60);

            // Create session
            $clientSession = ClientSession::create([
                'client_id' => $client->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'token' => $hashedToken,
                'expires_in' => $expiresAt,
                'status' => 1,
            ]);

            if (! $clientSession) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::CLIENT_SESSION_CREATE_FAILED,
                    'message' => 'Failed to create client session',
                    'errors' => [],
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::CLIENT_LOGIN_SUCCESS,
                'message' => 'Client logged in successfully',
                'data' => [
                    'token' => $clientSession->token,
                    'expires_in' => (int) now()->diffInSeconds($expiresAt),
                ],
            ], 200);

        } catch (\Throwable $e) {

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Login failed',
                'errors' => [
                    'exception' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Create New API Client
     *
     * Generates new client credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function create(Request $request)
    {
        try {

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|unique:client,name',
                'expires_in' => 'required|numeric|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Generate credentials
            $clientId = Client::generateClientId(); // FHOIHWOINFVWGI
            $clientSecret = Client::generateClientSecret(); // WREUHUIFHGUIQOGHDWEY856Y

            // Create client
            $client = Client::create([
                'name' => $request->name,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'expires_in' => now()->addDays($request->expires_in),
                'status' => 1,
            ]);

            if (! $client) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::CLIENT_CREATE_FAILED,
                    'message' => 'Failed to create client',
                    'errors' => [],
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::CLIENT_CREATED,
                'message' => 'Client created successfully',
                'data' => $client,
            ], 201);

        } catch (\Throwable $e) {

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Failed to create client',
                'errors' => [
                    'exception' => $e->getMessage(),
                ],
            ], 500);
        }
    }
}
