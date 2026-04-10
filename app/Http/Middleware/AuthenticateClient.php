<?php

namespace App\Http\Middleware;

use App\Constants\ResponseCode;
use App\Models\Auth\ClientSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AuthenticateClient
 *
 * Middleware to authenticate API clients using client token.
 *
 * Token must be provided in request header:
 * X-CLIENT-TOKEN
 *
 * Token is stored hashed in database. Incoming token
 * will be hashed and compared.
 *
 * If valid, client details are merged into request.
 *
 * @author Paramesh Guna
 *
 * @created 2026-03-05
 *
 * @version 1.0
 */
class AuthenticateClient
{
    /**
     * Handle an incoming request
     */
    public function handle(Request $request, Closure $next): Response
    {
        /**
         * Get token from header
         */
        $token = $request->header('X-CLIENT-TOKEN');

        if (! $token) {
            return response()->json([
                'status' => 'failed',
                'code' => ResponseCode::CLIENT_TOKEN_MISSING,
                'message' => 'Unauthorized',
                'errors' => [],
            ], 401);
        }

        /**
         * Find client session
         */
        $clientSession = ClientSession::with('client')
            ->where('token', $token)
            ->where('status', 1)
            ->first();

        if (! $clientSession) {
            return response()->json([
                'status' => 'failed',
                'code' => ResponseCode::CLIENT_TOKEN_INVALID,
                'message' => 'Unauthorized',
                'errors' => [],
            ], 401);
        }

        /**
         * Check expiration
         */
        if ($clientSession->expires_in && $clientSession->expires_in < now()) {

            return response()->json([
                'status' => 'failed',
                'code' => ResponseCode::CLIENT_TOKEN_EXPIRED,
                'message' => 'Unauthorized',
                'errors' => [],
            ], 401);
        }

        /**
         * Merge client into request
         */
        $request->merge([
            'client' => $clientSession->client,
            'client_session_id' => $clientSession->id,
        ]);

        return $next($request);
    }
}
