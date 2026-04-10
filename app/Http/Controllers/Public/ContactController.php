<?php

namespace App\Http\Controllers\Public;

use App\Constants\ResponseCode;
use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Contact;
use App\Models\Log\AuditLog;
use App\Models\Log\ErrorLog;
use App\Models\Log\LogMail;
use App\Models\Permission\Module;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Class ContactController
 *
 * Handles contact form submissions and contact log management.
 * Includes displaying contact submissions, storing new contact messages,
 * and logging mail activities.
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class ContactController extends Controller
{
    /**
     * Display Contacts in Contact Log
     *
     * Retrieves a paginated list of contact submissions with support for date filters:
     * - All contacts
     * - Last 7 days
     * - Last 30 days
     * - Last year
     * - Custom date range
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function displaycontact(Request $request)
    {
        try {
            $userId = Auth::check() ? Auth::id() : null;

            $validator = Validator::make($request->all(), [
                'filter' => 'nullable|in:all,7d,30d,1y,custom',
                'start_date' => 'required_if:filter,custom|date',
                'end_date' => 'required_if:filter,custom|date|after_or_equal:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => $validator->errors()->first(),
                ], 422);
            }

            $query = Contact::query();

            if ($request->filter === '7d') {
                $query->where('created_at', '>=', now()->subDays(7));
            }

            if ($request->filter === '30d') {
                $query->where('created_at', '>=', now()->subDays(30));
            }

            if ($request->filter === '1y') {
                $start = now()->subYear()->startOfYear();
                $end = now()->subYear()->endOfYear();
                $query->whereBetween('created_at', [$start, $end]);
            }

            if ($request->filter === 'custom') {
                $query->whereBetween('created_at', [
                    $request->start_date.' 00:00:00',
                    $request->end_date.' 23:59:59',
                ]);
            }

            $contacts = $query->latest()->paginate(10);

            $formatted = $contacts->getCollection()->values()->map(function ($contact, $index) use ($contacts) {
                return [
                    'no' => ($contacts->currentPage() - 1) * $contacts->perPage() + $index + 1,
                    'user_id' => $contact->user_id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'message' => $contact->message,
                    'created_at' => Carbon::parse($contact->created_at)->format('d-m-Y h:i A'),
                ];
            });

            AuditLog::log([
                'module' => Module::CONTACT_LOGS,
                'action' => 'VIEW_CONTACT_LOGS',
                'message' => 'User viewed contact logs',
                'user_id' => $userId,
                'custom1' => json_encode([
                    'total_records' => $contacts->total(),
                    'current_page' => $contacts->currentPage(),
                    'per_page' => $contacts->perPage(),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $formatted,
                'pagination' => [
                    'current_page' => $contacts->currentPage(),
                    'last_page' => $contacts->lastPage(),
                    'per_page' => $contacts->perPage(),
                    'total' => $contacts->total(),
                ],
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $userId ?? null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Failed to display contacts: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'filters' => $request->all(),
                    'error' => $e->getMessage(),
                ]),
                'ip_address' => $request->ip(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to display contacts. Error has been logged.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Store Contact Submission & Log Mail Activity
     *
     * Validates contact form input, creates a contact record,
     * logs mail activity, and returns success response.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'message' => 'required|string',
            ]);

            if ($validator->fails()) {
                // Get email from request for error logging
                $email = $request->input('email');
                $userIdFromEmail = null;

                if ($email) {
                    $user = User::where('email', $email)->first();
                    $userIdFromEmail = $user ? $user->id : null;
                }

                return response()->json([
                    'status' => 'failed',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $validated = $validator->validate();

            $user = User::where('email', $validated['email'])->first();
            $userId = $user ? $user->id : null;

            $contact = Contact::create([
                'user_id' => $userId,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'message' => $validated['message'],
            ]);

            if (! $contact) {
                ErrorLog::log([
                    'user_id' => $userId ?? Auth::id() ?? null,
                    'error_message' => 'Contact creation failed - Database insert returned false',
                    'error_code' => ResponseCode::SYSTEM_ERROR,
                    'file_path' => __FILE__,
                    'class' => __CLASS__,
                    'function' => __FUNCTION__,
                    'line' => __LINE__,
                    'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                    'context' => json_encode([
                        'input' => $request->all(),
                    ]),
                    'ip_address' => $request->ip(),
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Failed to submit contact form. Please try again.',
                ], 500);
            }

            $logMail = LogMail::log([
                'user_id' => $userId,
                'name' => $validated['name'],
                'recepient_mail' => $validated['email'],
                'system_mail' => config('mail.from.address'),
                'message' => json_encode(['content' => $validated['message']]),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'sent_at' => now(),
                'status' => LogMail::STATUS_PENDING,
            ]);
            if (! $logMail) {
                ErrorLog::logError([
                    'user_id' => $userId ?? Auth::id() ?? null,
                    'error_message' => 'Failed to create mail log entry',
                    'error_code' => ResponseCode::SYSTEM_ERROR,
                    'file_path' => __FILE__,
                    'class' => __CLASS__,
                    'function' => __FUNCTION__,
                    'line' => __LINE__,
                    'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                    'context' => json_encode([
                        'input' => $request->all(),
                    ]),
                    'ip_address' => $request->ip(),
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Failed to submit contact form. Please try again.',
                ], 500);
            }
            AuditLog::log([
                'module' => Module::CONTACT_LOGS,
                'action' => 'SUBMIT_CONTACT_FORM',
                'message' => 'Contact form submitted successfully',
                'user_id' => $userId,
                'old_value' => null,
                'new_value' => json_encode([
                    'contact_id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                ]),
                'custom1' => json_encode([
                    'mail_log_id' => $logMail->id,
                    'mail_status' => $logMail->status,
                    'user_agent' => $request->userAgent(),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Contact form submitted successfully',
                'data' => [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                ],
            ], 200);

        } catch (Exception $e) {
            // Get user ID from email if available for error logging
            $email = $request->input('email');
            $userIdFromEmail = null;

            if ($email) {
                $user = User::where('email', $email)->first();
                $userIdFromEmail = $user ? $user->id : null;
            }

            ErrorLog::log([
                'user_id' => Auth::id() ?? $userIdFromEmail ?? null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Unexpected error in contact submission: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                ]),
                'ip_address' => $request->ip(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Something went wrong. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
