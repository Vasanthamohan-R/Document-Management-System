<?php

namespace App\Http\Controllers\Admin;

use App\Helper\Export;
use App\Helper\HelperFunction;
use App\Http\Controllers\Controller;
use App\Mail\TemporaryPasswordMail;
use App\Models\Auth\User;
use App\Models\Log\AuditLog;
use App\Models\log\ErrorLog;
use App\Models\Log\LogMail;
use App\Models\Permission\Module;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use App\Constants\ResponseCode;


/**
 * Class UserController
 *
 * Handles user management operations for admin panel.
 * Includes listing, creating, updating, and deleting users.
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class UserController extends Controller
{
    /**
     * Get Users List with Filters
     *
     * Retrieves a paginated list of users with support for various filters:
     * - Search by name, email, or phone
     * - Filter by status, role, department
     * - Filter by date range
     * - Excel export functionality
     *
     *
     * @since 1.0.0
     */
    public function index(Request $request): JsonResponse|BinaryFileResponse
    {
        try {
            // Build base query with relationships
            $query = User::with(['role', 'department', 'country', 'state', 'city']);

            $query->where('status', '!=', User::STATUS_DELETED);

            if ($request->filled('searchTerm')) {
                $searchTerm = $request->searchTerm;
                $searchBy = $request->searchBy ?? 'name';

                if ($searchBy === 'name') {
                    $query->where('name', $searchTerm);
                } elseif ($searchBy === 'email') {
                    $query->where('email', $searchTerm);
                }
            }

            if ($request->filled('status') && $request->status > 0) {
                $query->where('status', $request->status);
            }

            if ($request->filled('role_id') && $request->role_id > 0) {
                $query->where('role_id', $request->role_id);
            }

            if ($request->filled('department_id') && $request->department_id > 0) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->filled('dateRange') && $request->dateRange !== 'all') {
                $dateRange = $request->dateRange;
                $now = Carbon::now();

                switch ($dateRange) {
                    case '7d':
                        $query->where('created_at', '>=', $now->subDays(7));
                        break;
                    case '30d':
                        $query->where('created_at', '>=', $now->subDays(30));
                        break;
                    case 'custom':
                        if ($request->filled('startDate') && $request->filled('endDate')) {
                            $startDate = Carbon::parse($request->startDate)->startOfDay();
                            $endDate = Carbon::parse($request->endDate)->endOfDay();

                            // Validate date range (max 30 days)
                            $daysDiff = $startDate->diffInDays($endDate);

                            if ($daysDiff > 31) {
                                return response()->json([
                                    'status' => 'failed',
                                    'message' => 'Date range cannot exceed 30 days. Please select a shorter range.',
                                ], 422);
                            }
                            $query->whereBetween('created_at', [$startDate, $endDate]);
                        }
                        break;
                }
            }

            $perPage = $request->perPage ?? 10;
            $page = $request->page ?? 1;
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role_id' => $user->role_id,
                    'role_name' => $user->role ? $user->role->name : null,
                    // Department - both ID and name
                    'department_id' => $user->department_id,
                    'department_name' => $user->department ? $user->department->name : null,

                    // Location - both ID and name
                    'country_id' => $user->country_id,
                    'country_name' => $user->country ? $user->country->name : null,
                    'state_id' => $user->state_id,
                    'state_name' => $user->state ? $user->state->name : null,

                    'address_line_1' => $user->address_line_1,
                    'address_line_2' => $user->address_line_2,
                    'address_line_3' => $user->address_line_3,
                    'pincode' => $user->pincode,
                    'city_id' => $user->city_id,
                    'city_name' => $user->city ? $user->city->name : null,
                    'status' => $user->status,
                    'dob' => $user->dob ? $user->dob->format('Y-m-d') : null,
                    'created_at' => $user->formatDate($user->created_at),
                    'updated_at' => $user->formatDate($user->updated_at),
                ];
            });

            if ($request->has('export') && $request->export == true) {
                try {
                    $headers = [
                        'Name',
                        'Email',
                        'Phone',
                        'Role',
                        'Department',
                        'Status',
                        'Created At',
                        'Updated At',
                    ];

                    $exportData = $formattedUsers->map(function ($user) {
                        return [
                            $user['name'],
                            $user['email'],
                            $user['phone'],
                            $user['role_name'],
                            $user['department_name'],
                            $user['status'] == 1 ? 'Active' : ($user['status'] == 2 ? 'Inactive' : 'Deleted'),
                            $user['created_at'],
                            $user['updated_at'],
                        ];
                    })->toArray();

                    AuditLog::log([
                        'user_id' => $request->user() ? $request->user()->id : null,
                        'module' => Module::USER_MANAGEMENT,
                        'action' => 'EXPORT_USERS',
                        'message' => 'Users export initiated',
                        'status' => AuditLog::STATUS_PENDING,
                        'old_value' => null,
                        'new_value' => json_encode([
                            'filters' => $request->except(['_token', 'export']),
                            'export_format' => 'excel',
                            'total_records' => $formattedUsers->count(),
                            'exported_at' => now()->toDateTimeString(),
                        ]),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);

                    return Excel::download(new Export($exportData, $headers), 'users.xlsx');
                } catch (Exception $e) {

                    ErrorLog::log([
                        'user_id' => $request->user() ? $request->user()->id : null,
                        'error_message' => 'Failed to export users: '.$e->getMessage(),
                        'error_code' => $e->getCode(),
                        'file_path' => $e->getFile(),
                        'line' => $e->getLine(),
                        'stack_trace' => $e->getTraceAsString(),
                        'function' => __FUNCTION__,
                        'class' => __CLASS__,
                        'context' => json_encode([
                            'export_request' => $request->except(['_token']),
                            'error_details' => $e->getMessage(),
                        ]),
                    ]);

                    return response()->json([
                        'status' => 'failed',
                        'message' => 'Failed to export users. Please try again.',
                    ], 500);
                }
            }

           
            AuditLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'module' => Module::USER_MANAGEMENT,
                'action' => 'VIEW_USERS',
                'message' => 'Users list viewed with filters',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode($request->except(['_token'])),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $encryptedData = HelperFunction::encrypt([
                'data'       => $formattedUsers,
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page'    => $users->lastPage(),
                    'per_page'     => $users->perPage(),
                    'total'        => $users->total(),
                ],
            ]);

            return HelperFunction::response($encryptedData, 'Users retrieved successfully', 'success', ResponseCode::SUCCESS, Response::HTTP_OK);



        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Failed to fetch users: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'function' => __FUNCTION__,
                'class' => __CLASS__,
                'context' => json_encode([
                    'filters' => $request->except(['_token']),
                    'error' => $e->getMessage(),
                ]),
            ]);

            return HelperFunction::response( null, 'Failed to fetch users', 'error', ResponseCode::SYSTEM_ERROR, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create New User
     *
     * Validates request input, creates a new user record with a temporary password,
     * and sends the temporary password via email to the new user.
     *
     *
     * @since 1.0.0
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20',
                'dob' => 'required|date',
                'department_id' => 'required|exists:department,id',
                'country_id' => 'required|exists:country,id',
                'state_id' => 'required|exists:state,id',
                'city_id' => 'required|exists:city,id',
                'pincode' => 'required|string|max:20',
                'address_line_1' => 'required|string|max:255',
                'address_line_2' => 'required|string|max:255',
                'address_line_3' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $temporaryPassword = Str::random(10);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword),
                'phone' => $request->phone,
                'dob' => $request->dob,
                'role_id' => $request->role_id,
                'department_id' => $request->department_id,
                'country_id' => $request->country_id,
                'state_id' => $request->state_id,
                'city_id' => $request->city_id,
                'pincode' => $request->pincode,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
                'address_line_3' => $request->address_line_3,
                'status' => User::STATUS_PASSWORD_UNCHANGED,
                'email_verified' => User::EMAIL_UNVERIFIED,
            ]);

            if (! $user) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Failed to create user. Please try again.',
                ], 500);
            }

            try {
                Mail::to($user->email)->send(new TemporaryPasswordMail($user, $temporaryPassword));
                $emailSent = true;

                // Log successful email in LogMail
                LogMail::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'recepient_mail' => $user->email,
                    'system_mail' => config('mail.from.address'),
                    'message' => 'Temporary password sent successfully for new user registration',
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

            } catch (Exception $e) {
                $emailSent = false;
                LogMail::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'recepient_mail' => $user->email,
                    'system_mail' => config('mail.from.address'),
                    'message' => 'Failed to send temporary password',
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'status' => 'failed',
                    'sent_at' => null,
                ]);

                // Continue execution - user is created but email failed
                Log::warning('User created but email sending failed: '.$e->getMessage());
            }

            AuditLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'module' => Module::USER_MANAGEMENT,
                'action' => 'CREATE_USER',
                'message' => 'User created successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'department_id' => $user->department_id,
                    'temporary_password_sent' => $emailSent,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $responseData = [
                'id'                 => $user->id,
                'name'               => $user->name,
                'email'              => $user->email,
                'phone'              => $user->phone,
                'role'               => $user->role ? $user->role->name : null,
                'department'         => $user->department ? $user->department->name : null,
                'temporary_password' => $temporaryPassword,
            ];

            $encryptedData = HelperFunction::encrypt($responseData);

            return HelperFunction::response($encryptedData, 'User created successfully', 'success', ResponseCode::SUCCESS, Response::HTTP_CREATED);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in user creation: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'request_data' => $request->except(['password']),
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to create user. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Update User by ID
     *
     * Validates request input, finds the user by ID,
     * and updates the user's information with provided data.
     *
     *
     * @since 1.0.0
     */
    public function updateUserById(Request $request): JsonResponse
    {
        try {
            $id        = $request->id;
            $validator = Validator::make(
                $request->all(),
                [
                    'id'             => 'required|exists:users,id',
                    'name'           => 'required|string|max:255',
                    'email'          => 'required|email|unique:users,email,' . $id,
                    'phone'          => 'nullable|string|max:20',
                    'dob'            => 'nullable|date',
                    'role_id'        => 'required|exists:roles,id',
                    'department_id'  => 'nullable|exists:department,id',
                    'country_id'     => 'nullable|exists:country,id',
                    'state_id'       => 'nullable|exists:state,id',
                    'city_id'        => 'nullable|exists:city,id',
                    'pincode'        => 'nullable|string|max:20',
                    'address_line_1' => 'nullable|string|max:255',
                    'address_line_2' => 'nullable|string|max:255',
                    'address_line_3' => 'nullable|string|max:255',
                    'status'         => 'nullable|in:1,2,4',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 'failed',
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $user = User::find($id);
            if (! $user) {
                return response()->json([
                    'status'  => 'failed',
                    'message' => 'User not found',
                ], 404);
            }

            $oldData = $user->toArray();

            $user->update([
                'name'           => $request->name,
                'email'          => $request->email,
                'phone'          => $request->phone,
                'dob'            => $request->dob,
                'role_id'        => $request->role_id,
                'department_id'  => $request->department_id,
                'country_id'     => $request->country_id,
                'state_id'       => $request->state_id,
                'city_id'        => $request->city_id,
                'pincode'        => $request->pincode,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
                'address_line_3' => $request->address_line_3,
                'status'         => $request->status ?? $user->status,
            ]);

            AuditLog::log([
                'user_id'    => $request->user() ? $request->user()->id : null,
                'module'     => Module::USER_MANAGEMENT,
                'action'     => 'UPDATE_USER',
                'message'    => 'User updated successfully',
                'status'     => AuditLog::STATUS_SUCCESS,
                'old_value'  => json_encode($oldData),
                'new_value'  => json_encode($request->except(['_token'])),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return HelperFunction::response( null, 'User updated successfully', 'success', ResponseCode::SUCCESS, Response::HTTP_OK);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id'       => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in user update: ' . $e->getMessage(),
                'error_code'    => $e->getCode(),
                'file_path'     => $e->getFile(),
                'class'         => __CLASS__,
                'function'      => __FUNCTION__,
                'line'          => $e->getLine(),
                'stack_trace'   => $e->getTraceAsString(),
                'context'       => json_encode([
                    'request_data'      => $request->all(),
                    'user_id_to_update' => $request->id,
                    'error'             => $e->getMessage(),
                ]),
            ]);

            return HelperFunction::response( null, 'Failed to update user. Please try again.', 'error', ResponseCode::SYSTEM_ERROR, Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * Delete User by ID (Soft Delete)
     *
     * Validates request input, finds the user by ID,
     * and updates the user's status to deleted (soft delete).
     *
     *
     * @since 1.0.0
     */
    public function deleteUserByID(Request $request): JsonResponse
    {
        try {
           $id = $request->id;
           $validator = Validator::make(
                $request->all(),
                [
                    'id' => 'required|exists:users,id'
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

        $user = User::find($id);
            if (! $user) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'User not found',
                ], 404);
            }

            // Check if trying to delete own account
            $currentUser = $request->user();
            if ($currentUser && $currentUser->id == $user->id) {
                AuditLog::log([
                    'user_id' => $currentUser->id,
                    'module' => Module::USER_MANAGEMENT,
                    'action' => 'DELETE_USER_FAILED',
                    'message' => 'User deletion failed - Cannot delete own account',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode(['user_id_to_delete' => $request->id]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'failed',
                    'message' => 'You cannot delete your own account',
                ], 403);
            }
            $oldData = $user->toArray();

            $user->status = User::STATUS_DELETED;
            $user->save();

            AuditLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'module' => Module::USER_MANAGEMENT,
                'action' => 'DELETE_USER',
                'message' => 'User deleted successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => json_encode($oldData),
                'new_value' => json_encode(['status' => 'deleted']),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $responseData = [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ];

            $encryptedData = HelperFunction::encrypt($responseData);

            return HelperFunction::response($encryptedData, 'User deleted successfully', 'success', ResponseCode::SUCCESS, Response::HTTP_OK);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in user deletion: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'request_data' => $request->all(),
                    'user_id_to_delete' => $request->id,
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to delete user. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
