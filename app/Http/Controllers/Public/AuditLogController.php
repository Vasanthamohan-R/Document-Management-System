<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Log\AuditLog;
use App\Models\Log\ErrorLog;
use App\Models\Permission\Module;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Class AuditLogController
 *
 * Handles audit log management operations.
 * Includes retrieving and filtering audit logs with various search criteria.
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class AuditLogController extends Controller
{
    /**
     * Get Audit Logs List with Filters
     *
     * Retrieves a paginated list of audit logs with support for various filters:
     * - Search by client_id, module, email, user_id, action, message, ip_address
     * - Filter by status (Success, Failed, Pending)
     * - Filter by date range
     * - Filter by client_id and user_id
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function index(Request $request)
    {
        try {
            $userId = Auth::check() ? Auth::id() : null;

            $validator = Validator::make($request->all(), [
                'search' => 'nullable|string|max:255',
                'searchBy' => 'nullable|in:all,client_id,module,email,user_id',
                'status' => 'nullable|in:Success,Failed,Pending',
                'startDate' => 'nullable|date',
                'endDate' => 'nullable|date|after_or_equal:startDate',
                'page' => 'nullable|integer|min:1',
                'client_id' => 'nullable|integer',
                'user_id' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                ErrorLog::logError([
                    'user_id' => $userId,
                    'error_message' => 'Validation failed during audit log fetch',
                    'error_code' => 422,
                    'file_path' => __FILE__,
                    'class' => __CLASS__,
                    'function' => __FUNCTION__,
                    'line' => __LINE__,
                    'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                    'context' => json_encode([
                        'errors' => $validator->errors()->toArray(),
                        'input' => $request->all(),
                    ]),
                ]);

                return response()->json([
                    'status' => 'failed',
                    'message' => $validator->errors()->first(),
                ], 422);
            }

            $query = AuditLog::with('user', 'client');

            // Apply client ID filter
            if ($request->filled('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            // Apply user ID filter
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Apply search filter across multiple fields or specific fields based on searchBy parameter
            if ($request->filled('search')) {
                $search = $request->search;
                $searchBy = $request->searchBy ?? 'all';

                $query->where(function ($q) use ($search, $searchBy) {
                    if ($searchBy === 'all') {
                        $q->where('client_id', 'LIKE', "%{$search}%")
                            ->orWhere('module', 'LIKE', "%{$search}%")
                            ->orWhere('action', 'LIKE', "%{$search}%")
                            ->orWhere('message', 'LIKE', "%{$search}%")
                            ->orWhere('ip_address', 'LIKE', "%{$search}%")
                            ->orWhereHas('user', function ($q2) use ($search) {
                                $q2->where('email', 'LIKE', "%{$search}%");
                            });
                    } elseif ($searchBy === 'client_id') {
                        $q->where('client_id', 'LIKE', "%{$search}%");
                    } elseif ($searchBy === 'user_id') {
                        $q->where('user_id', 'LIKE', "%{$search}%");
                    } elseif ($searchBy === 'module') {
                        $q->where('module', 'LIKE', "%{$search}%");
                    } elseif ($searchBy === 'email') {
                        $q->whereHas('user', function ($q2) use ($search) {
                            $q2->where('email', 'LIKE', "%{$search}%");
                        });
                    }
                });
            }
            if ($request->filled('status')) {
                $statusMap = [
                    'Success' => '1',
                    'Failed' => '2',
                    'Pending' => '3',
                ];

                $query->where('status', $statusMap[$request->status]);
            }

            if ($request->filled('startDate') && $request->filled('endDate')) {
                $query->whereBetween('created_at', [
                    $request->startDate.' 00:00:00',
                    $request->endDate.' 23:59:59',
                ]);
            }

            $logs = $query->latest()->paginate(10);

            // Format the response with sequential numbering
            $formatted = $logs->getCollection()->values()->map(function ($log, $index) use ($logs) {
                return [
                    'no' => ($logs->currentPage() - 1) * $logs->perPage() + $index + 1,
                    'id' => (int) $log->id,
                    'client_id' => $log->client_id,
                    'user_id' => $log->user_id,
                    'module' => $log->module,
                    'action' => $log->action,
                    'message' => $log->message,
                    'status' => $log->status,
                    'ip_address' => $log->ip_address,
                    'email' => optional($log->user)->email ?? 'N/A',
                    'created_at' => $log->created_at ? $log->created_at->format('d-m-Y h:i A') : null,
                    'old_value' => $log->old_value,
                    'new_value' => $log->new_value,
                    'custom1' => $log->custom1,
                    'custom2' => $log->custom2,
                ];
            });

            AuditLog::log([
                'module' => Module::AUDIT_LOGS,
                'action' => 'VIEW_AUDIT_LOGS',
                'message' => 'User viewed audit logs list',
                'user_id' => $userId,
                'custom1' => json_encode([
                    'filters_applied' => array_filter([
                        'search' => $request->search,
                        'searchBy' => $request->searchBy,
                        'status' => $request->status,
                        'startDate' => $request->startDate,
                        'endDate' => $request->endDate,
                        'client_id' => $request->client_id,
                        'user_id' => $request->user_id,
                        'page' => $request->page,
                    ]),
                    'total_records' => $logs->total(),
                    'current_page' => $logs->currentPage(),
                    'per_page' => $logs->perPage(),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $formatted,
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $userId ?? null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Failed to fetch audit logs: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'filters' => $request->all(),
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch audit logs. Error has been logged.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
