<?php

namespace App\Http\Controllers\Auth;

use App\Constants\ResponseCode;
use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Log\AuditLog;
use App\Models\Log\ErrorLog;
use App\Models\Log\LogMail;
use App\Models\Auth\Otp;
use App\Models\Permission\Module;
use App\Services\OtpService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;
use App\Helper\HelperFunction;

/**
 * Class AuthController
 *
 * Handles user authentication for both web and mobile platforms.
 * Includes registration, login, and fetching user details.
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class AuthController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Register a new user
     *
     * Validates request input, creates a user record,
     * and returns the user with status code and ResponseCode.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
                'phone' => 'required|string|max:20',
                'address_line_1' => 'required|string|max:255',
                'address_line_2' => 'required|string|max:255',
                'address_line_3' => 'required|string|max:255',
                'city_id' => 'required|exists:city,id',
                'country_id' => 'required|exists:country,id',
                'state_id' => 'required|exists:state,id',
                'pincode' => 'required|string|max:255',
                'dob' => 'required|date|before:'.now()->subYears(18)->format('Y-m-d'),
                'department_id' => 'required|exists:department,id',
                'role' => 'nullable|exists:roles,id',
            ]);

            if ($validator->fails()) {
                return HelperFunction::response(null, $validator->errors()->first(), 'error', ResponseCode::VALIDATION_FAILED, Response::HTTP_BAD_REQUEST);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'role_id' => $request->role ?? 2,
                'status' => User::STATUS_ACTIVE,
                'email_verified' => User::EMAIL_UNVERIFIED,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
                'address_line_3' => $request->address_line_3,
                'city_id' => $request->city_id,
                'state_id' => $request->state_id,
                'country_id' => $request->country_id,
                'pincode' => $request->pincode,
                'dob' => $request->dob,
                'department_id' => $request->department_id,
            ]);

            if (! $user) {
                return HelperFunction::response(null, 'Failed to create user account', 'error', ResponseCode::SYSTEM_ERROR, Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // Send OTP
            $result = $this->otpService->sendOtp($user->email, 'registration');

            // Log OTP sending in MailLog
            if ($result['status'] === 'success') {
                LogMail::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'recepient_mail' => $user->email,
                    'system_mail' => config('mail.from.address'),
                    'message' => 'Registration OTP sent successfully. Expires at: '.($result['expires_at'] ?? 'N/A'),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_REGISTRATION,
                    'action' => 'REGISTER',
                    'message' => 'User registered successfully',
                    'status' => AuditLog::STATUS_SUCCESS,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'name' => $user->name,
                        'email' => $user->email,
                        'role_id' => $user->role_id,
                        'department_id' => $user->department_id,
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            } else {
                ErrorLog::log([
                    'user_id' => $user->id,
                    'error_message' => 'OTP sending failed during registration',
                    'error_code' => $result['code'] ?? ResponseCode::SYSTEM_ERROR,
                    'file_path' => __FILE__,
                    'class' => __CLASS__,
                    'function' => __FUNCTION__,
                    'line' => __LINE__,
                    'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                    'context' => json_encode([
                        'email' => $user->email,
                        'purpose' => 'registration',
                        'reason' => $result['message'] ?? 'Unknown error',
                    ]),
                ]);

                LogMail::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'recepient_mail' => $user->email,
                    'system_mail' => config('mail.from.address'),
                    'message' => 'Failed to send registration OTP. Reason: '.($result['message'] ?? 'Unknown error'),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'status' => 'failed',
                    'sent_at' => null,
                ]);
            }

            $responseData = [
                'email' => $user->email,
                'expires_at' => $result['expires_at'] ?? null,
            ];

            return HelperFunction::response( $responseData, 'User registered successfully. Please verify your email with the OTP sent.', 'success', ResponseCode::USER_CREATED, Response::HTTP_CREATED);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => Auth::id() ?? null,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode($request->except(['password', 'password_confirmation'])),
            ]);

            return HelperFunction::response( null, 'Something went wrong during registration', 'error', ResponseCode::SYSTEM_ERROR, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Send OTP for password reset
     *
     * Validates email input, checks if user exists,
     * and sends OTP to the user's email for password reset.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $email = $request->email;
            $user = User::where('email', $email)->first();

            if (! $user) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::NOT_FOUND,
                    'message' => 'If the email exists in our system, you will receive an OTP.',
                ], 404);
            }

            $result = $this->otpService->sendOtp($email, 'password_reset');

            if ($result['status'] === 'error') {
                // Log OTP failure in MailLog only (no AuditLog for failure)
                LogMail::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'recepient_mail' => $user->email,
                    'system_mail' => config('mail.from.address'),
                    'message' => 'Failed to send password reset OTP. Reason: '.($result['message'] ?? 'Unknown error'),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'status' => 'failed',
                    'sent_at' => null,
                ]);

                return response()->json([
                    'status' => $result['status'],
                    'code' => $result['code'],
                    'message' => $result['message'],
                ], $result['http_code']);
            }

            // Log successful OTP sending in MailLog
            LogMail::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'recepient_mail' => $user->email,
                'system_mail' => config('mail.from.address'),
                'message' => 'Password reset OTP sent successfully. Expires at: '.($result['expires_at'] ?? 'N/A'),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_FORGOT_PASSWORD,
                'action' => 'FORGOT_PASSWORD',
                'message' => 'Password reset OTP sent successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'email' => $user->email,
                    'expires_at' => $result['expires_at'] ?? null,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => $result['status'],
                'code' => $result['code'],
                'message' => $result['message'],
                'expires_at' => $result['expires_at'],
            ], $result['http_code']);

        } catch (Exception $e) {
            $userId = null;

            if (isset($user) && $user) {
                $userId = $user->id;
            } elseif (isset($request->email)) {
                $tempUser = User::where('email', $request->email)->first();
                $userId = $tempUser ? $tempUser->id : null;
            }

            ErrorLog::log([
                'user_id' => $userId,
                'error_message' => 'Unexpected error in forgotPassword: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'email' => $request->email ?? 'not provided',
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong. Please try again later.',
            ], 500);
        }
    }

    /**
     * Verify OTP for registration or password reset
     *
     * Validates the identifier (email), OTP code, and purpose fields.
     * Verifies the OTP through the OTP service and returns the verification result.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function verifyOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'identifier' => 'required|string|email',
                'otp' => 'required|string|size:6',
                'purpose' => 'required|string|in:registration,password_reset',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::where('email', $request->identifier)->first();
            $userId = $user ? $user->id : null;

            $result = $this->otpService->verifyOtp(
                $request->identifier,
                $request->otp,
                $request->purpose
            );

            // Prepare audit log data
            $auditData = [
                'user_id' => $userId,
                'module' => Module::AUTH_VERIFY_OTP,
                'action' => 'VERIFY_OTP',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ];

            if ($result['status'] === 'error') {
                // Build new_value for failed attempt
                $newValue = [
                    'purpose' => $request->purpose,
                    'reason' => $result['message'] ?? null,
                ];

                // Add attempt-related fields if they exist
                if (isset($result['remaining_attempts'])) {
                    $newValue['remaining_attempts'] = $result['remaining_attempts'];
                }
                if (isset($result['attempts_used'])) {
                    $newValue['attempts_used'] = $result['attempts_used'];
                }
                if (isset($result['max_attempts'])) {
                    $newValue['max_attempts'] = $result['max_attempts'];
                }
                if (isset($result['locked_for_hours'])) {
                    $newValue['locked_for_hours'] = $result['locked_for_hours'];
                }
                if (isset($result['hours_remaining'])) {
                    $newValue['hours_remaining'] = $result['hours_remaining'];
                }
                if (isset($result['locked_until'])) {
                    $newValue['locked_until'] = $result['locked_until'];
                }

                AuditLog::log(array_merge($auditData, [
                    'message' => 'OTP verification failed',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode($newValue),
                ]));

                // Build response with only fields that exist in service response
                $responseData = [
                    'status' => $result['status'],
                    'code' => $result['code'],
                    'message' => $result['message'],
                ];

                // Only add these fields if they exist in the result
                if (isset($result['remaining_attempts'])) {
                    $responseData['remaining_attempts'] = $result['remaining_attempts'];
                }
                if (isset($result['attempts_used'])) {
                    $responseData['attempts_used'] = $result['attempts_used'];
                }
                if (isset($result['max_attempts'])) {
                    $responseData['max_attempts'] = $result['max_attempts'];
                }
                if (isset($result['locked_for_hours'])) {
                    $responseData['locked_for_hours'] = $result['locked_for_hours'];
                }
                if (isset($result['hours_remaining'])) {
                    $responseData['hours_remaining'] = $result['hours_remaining'];
                }
                if (isset($result['locked_until'])) {
                    $responseData['locked_until'] = $result['locked_until'];
                }

                return response()->json($responseData, $result['http_code']);
            }

            // Success case
            AuditLog::log(array_merge($auditData, [
                'message' => 'OTP verified successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'purpose' => $request->purpose,
                ]),
            ]));

            return response()->json([
                'status' => $result['status'],
                'code' => $result['code'],
                'message' => $result['message'],
            ], $result['http_code']);

        } catch (Exception $e) {
            $userId = null;
            if (isset($request->identifier)) {
                $tempUser = User::where('email', $request->identifier)->first();
                $userId = $tempUser ? $tempUser->id : null;
            }

            ErrorLog::log([
                'user_id' => $userId,
                'error_message' => 'Unexpected error in verifyOtp: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'identifier' => $request->identifier ?? 'not provided',
                    'purpose' => $request->purpose ?? 'not provided',
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
            ], 500);
        }
    }

    /**
     * Reset password for both forgot password and change temporary password flows
     *
     * Validates email and password requirements, checks if user has either:
     * 1. A verified OTP within the last 5 minutes (forgot password flow)
     * 2. A temporary password status (first login / password change flow)
     * Updates user password, changes status to active, and expires used OTPs.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (! $user) {

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'message' => 'User not found',
                ], 404);
            }

            // Check if valid reset attempt via OTP (forgot password flow)
            $isForgotPassword = Otp::where('user_id', $user->id)
                ->where('purpose', 'password_reset')
                ->where('status', Otp::STATUS_VERIFIED)
                ->where('verified_at', '>=', Carbon::now()->subMinutes(5))
                ->exists();

            // Check if user has temporary password
            $isTemporaryPassword = ($user->status == User::STATUS_PASSWORD_UNCHANGED);

            // Allow reset if either: valid OTP exists OR user has temporary password
            if (! $isForgotPassword && ! $isTemporaryPassword) {

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::OTP_NOT_VERIFIED,
                    'message' => 'No verified OTP found. Please request a new password reset.',
                ], 400);
            }

            // Update user status based on flow
            if ($isTemporaryPassword) {
                $user->status = User::STATUS_ACTIVE;
                $user->email_verified = User::EMAIL_VERIFIED;
            }

            $user->password = Hash::make($request->password);
            $user->save();

            // Expire any existing OTPs for this user to prevent reuse
            Otp::where('user_id', $user->id)
                ->where('purpose', 'password_reset')
                ->where('status', Otp::STATUS_VERIFIED)
                ->update(['status' => Otp::STATUS_EXPIRED]);

            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_RESET_PASSWORD,
                'action' => 'RESET_PASSWORD',
                'message' => 'Password reset successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'email' => $user->email,
                    'reset_type' => $isTemporaryPassword ? 'temporary_password' : 'forgot_password',
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::PASSWORD_RESET_SUCCESS,
                'message' => 'Password reset successfully. You can now login.',
                'data' => [
                    'email' => $user->email,
                    'status' => $user->status,
                ],
            ], 200);

        } catch (Exception $e) {
            $userId = null;
            if (isset($user) && $user) {
                $userId = $user->id;
            } elseif (isset($request->email)) {
                $tempUser = User::where('email', $request->email)->first();
                $userId = $tempUser ? $tempUser->id : null;
            }

            ErrorLog::log([
                'user_id' => $userId,
                'error_message' => 'Unexpected error in resetPassword: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'email' => $request->email ?? 'not provided',
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Failed to reset password. Please try again.',
            ], 500);
        }
    }

    /**
     * Resend OTP for registration or password reset
     *
     * Validates the identifier (email) and purpose fields.
     * Resends a new OTP to the user's email address for the specified purpose.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function resendOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'identifier' => 'required|string|email',
                'purpose' => 'required|string|in:registration,password_reset',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::where('email', $request->identifier)->first();
            $userId = $user ? $user->id : null;

            $result = $this->otpService->sendOtp(
                $request->identifier,
                $request->purpose
            );

            if ($result['status'] === 'error') {
                LogMail::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'recepient_mail' => $user->email,
                    'system_mail' => config('mail.from.address'),
                    'message' => 'Failed to resend '.$request->purpose.' OTP. Reason: '.($result['message'] ?? 'Unknown error'),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'status' => 'failed',
                    'sent_at' => null,
                ]);

                return response()->json([
                    'status' => $result['status'],
                    'code' => $result['code'],
                    'message' => $result['message'],
                ], $result['http_code']);
            }

            // Log successful OTP resend in MailLog
            LogMail::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'recepient_mail' => $user->email,
                'system_mail' => config('mail.from.address'),
                'message' => $request->purpose.' OTP resent successfully. Expires at: '.($result['expires_at'] ?? 'N/A'),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            // AuditLog only for success
            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_RESEND_OTP,
                'action' => 'RESEND_OTP',
                'message' => 'OTP resent successfully for '.$request->purpose,
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'purpose' => $request->purpose,
                    'expires_at' => $result['expires_at'] ?? null,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => $result['status'],
                'code' => $result['code'],
                'message' => $result['message'],
                'expires_at' => $result['expires_at'],
            ], $result['http_code']);

        } catch (Exception $e) {
            $userId = null;
            if (isset($user) && $user) {
                $userId = $user->id;
            } elseif (isset($request->identifier)) {
                $tempUser = User::where('email', $request->identifier)->first();
                $userId = $tempUser ? $tempUser->id : null;
            }

            ErrorLog::log([
                'user_id' => $userId,
                'error_message' => 'Unexpected error in resendOtp: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'identifier' => $request->identifier ?? 'not provided',
                    'purpose' => $request->purpose ?? 'not provided',
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
            ], 500);
        }
    }

    /**
     * Login API
     *
     * Authenticates user credentials and generates access tokens
     * based on the platform (web or app). Returns access, refresh tokens,
     * token expiry, user details, and ResponseCode.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
                'platform' => 'required|in:web,app',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $input = $validator->validated();
            
            // Unified brute-force protection using rate limiting and intentional delay
            $throttleKey = Str::lower($input['email']) . '|' . $request->ip();
            if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
                $seconds = RateLimiter::availableIn($throttleKey);
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::SYSTEM_ERROR,
                    'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
                ], 429);
            }

            $user = User::where('email', $input['email'])->first();

            if (! $user) {
                RateLimiter::hit($throttleKey, 60);
                usleep(500000);
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'message' => 'Invalid credentials',
                    'errors' => '',
                ], 404);
            }

            // Consolidate account status checks (prevent enumeration attack)
            if (in_array($user->status, [
                User::STATUS_DELETED, 
                User::STATUS_SUSPENDED, 
                User::STATUS_INACTIVE,
                User::STATUS_PASSWORD_UNCHANGED,
            ])) {
                Auth::logout();
                RateLimiter::hit($throttleKey, 300);

                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_LOGIN,
                    'action' => 'LOGIN_BLOCKED',
                    'message' => 'Login blocked - Account status issue',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'status' => $user->status,
                        'platform' => $input['platform'],
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::ACCOUNT_INACTIVE,
                    'message' => 'Your account not active. Please contact support.',
                ], 403);
            }

            // Check account lock
            if ($user->false_attempt >= User::FALSE_ATTEMPT_COUNT) {
                if ($user->updated_at && $user->updated_at->diffInHours(Carbon::now()) >= 24) {
                    $previousAttempts = $user->false_attempt;
                    $user->false_attempt = 0;
                    $user->save();

                    AuditLog::log([
                        'user_id' => $user->id,
                        'module' => Module::AUTH_LOGIN,
                        'action' => 'ACCOUNT_UNLOCKED',
                        'message' => 'Account automatically unlocked after 24 hours',
                        'status' => AuditLog::STATUS_SUCCESS,
                        'old_value' => json_encode(['false_attempts' => $previousAttempts]),
                        'new_value' => json_encode(['false_attempts' => 0]),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);
                } else {
                    AuditLog::log([
                        'user_id' => $user->id,
                        'module' => Module::AUTH_LOGIN,
                        'action' => 'LOGIN_BLOCKED',
                        'message' => 'Login blocked - Account locked',
                        'status' => AuditLog::STATUS_FAILED,
                        'old_value' => null,
                        'new_value' => json_encode([
                            'false_attempts' => $user->false_attempt,
                            'platform' => $input['platform'],
                            'reason' => 'Account locked due to multiple failed attempts',
                        ]),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);

                    return response()->json([
                        'status' => 'error',
                        'code' => ResponseCode::ACCOUNT_LOCKED,
                        'message' => 'Your account is locked due to multiple failed login attempts. Please try again after 24 hours.',
                    ], 403);
                }
            }

            // Check password
            if (! Hash::check($input['password'], $user->password)) {
                $user->false_attempt += 1;
                $user->save();
                
                RateLimiter::hit($throttleKey, 60);
                usleep(500000);

                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_LOGIN,
                    'action' => 'LOGIN_FAILED',
                    'message' => 'Login failed - Invalid password',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'false_attempts' => $user->false_attempt,
                        'platform' => $input['platform'],
                        'remaining_attempts' => User::FALSE_ATTEMPT_COUNT - $user->false_attempt,
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::INVALID_PASSWORD,
                    'message' => 'Invalid credentials',
                    'errors' => '',
                    'remaining_attempts' => User::FALSE_ATTEMPT_COUNT - $user->false_attempt,
                ], 401);
            }

            // Reset false attempts on successful password
            if ($user->false_attempt > 0) {
                $user->false_attempt = 0;
                $user->save();
            }

            // Check for temporary password
            if ($user->status == User::STATUS_PASSWORD_UNCHANGED) {
                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_LOGIN,
                    'action' => 'LOGIN_BLOCKED',
                    'message' => 'Login blocked - Temporary password requires change',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'status' => $user->status,
                        'platform' => $input['platform'],
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::PASSWORD_TEMPORARY,
                    'message' => 'Your account is using a temporary password. Please change your password to continue.',
                    'data' => [
                        'email' => $user->email,
                        'requires_password_change' => true,
                    ],
                ], 403);
            }

            // Check email verification
            if ($user->email_verified == User::EMAIL_UNVERIFIED) {
                $result = $this->otpService->sendOtp($user->email, 'registration');

                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_LOGIN,
                    'action' => 'LOGIN_BLOCKED',
                    'message' => 'Login blocked - Email not verified',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'email_verified' => $user->email_verified,
                        'platform' => $input['platform'],
                        'otp_sent' => $result['status'] === 'success',
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                if ($result['status'] === 'error') {
                    LogMail::create([
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'recepient_mail' => $user->email,
                        'system_mail' => config('mail.from.address'),
                        'message' => 'Failed to send verification OTP. Reason: '.($result['message'] ?? 'Unknown error'),
                        'user_agent' => $request->userAgent(),
                        'ip_address' => $request->ip(),
                        'status' => 'failed',
                        'sent_at' => null,
                    ]);

                }

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::EMAIL_NOT_VERIFIED,
                    'message' => 'Email not verified. A verification OTP has been sent to your email.',
                    'data' => [
                        'email' => $user->email,
                        'user_id' => $user->id,
                        'expires_at' => $result['expires_at'],
                    ],
                ], 403);
            }

            // Generate tokens
            $clientId = $input['platform'] === 'web'
                ? config('services.passport.web_client_id')
                : config('services.passport.app_client_id');

            $clientSecret = $input['platform'] === 'web'
                ? config('services.passport.web_client_secret')
                : config('services.passport.app_client_secret');

            $tokenRequest = Request::create('/oauth/token', 'POST', [
                'grant_type' => 'password',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'username' => $input['email'],
                'password' => $input['password'],
                'scope' => '',
            ]);

            $response = app()->handle($tokenRequest);

            if ($response->getStatusCode() !== 200) {
                $errorBody = json_decode($response->getContent(), true);

                ErrorLog::log([
                    'user_id' => $user->id,
                    'error_message' => 'Token generation failed during login',
                    'error_code' => ResponseCode::INVALID_CREDENTIALS,
                    'file_path' => __FILE__,
                    'class' => __CLASS__,
                    'function' => __FUNCTION__,
                    'line' => __LINE__,
                    'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                    'context' => json_encode([
                        'email' => hash('sha256', $user->email),
                        'platform' => $input['platform'],
                        'status_code' => $response->getStatusCode(),
                        'error_response' => $errorBody['message'] ?? $errorBody['error'] ?? 'Unknown error',
                    ]),
                ]);

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::INVALID_CREDENTIALS,
                    'message' => 'Token generation failed',
                    'errors' => $errorBody['message'] ?? $errorBody['error'] ?? 'Unknown error',
                ], $response->getStatusCode());
            }

            $tokenData = json_decode($response->getContent(), true);

            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_LOGIN,
                'action' => 'LOGIN_SUCCESS',
                'message' => 'User logged in successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'platform' => $request->platform,
                    'email' => hash('sha256', $user->email),
                    'ip_address' => $request->ip(),
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            RateLimiter::clear($throttleKey);

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::USER_LOGIN_SUCCESS,
                'message' => 'Login successful',
                'data' => [
                    'platform' => $request->platform,
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'],
                    'expires_in' => $tokenData['expires_in'] ?? null,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ],
            ], 200);

        } catch (Exception $e) {
            $userId = null;
            if (isset($user) && $user) {
                $userId = $user->id;
            } elseif (isset($input['email'])) {
                $tempUser = User::where('email', $input['email'])->first();
                $userId = $tempUser ? $tempUser->id : null;
            }

            ErrorLog::log([
                'user_id' => $userId,
                'error_message' => 'Unexpected error in login: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'email' => isset($request->email) ? hash('sha256', $request->email) : 'not provided',
                    'platform' => $request->platform ?? 'unknown',
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * User Logout
     *
     * Revokes the user's access token and logs them out of the system.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            if ($user) {
                $user->token()->revoke();

                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_LOGOUT,
                    'action' => 'LOGOUT',
                    'message' => 'User logged out successfully',
                    'status' => AuditLog::STATUS_SUCCESS,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'email' => $user->email,
                        'token_revoked' => true,
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'success',
                    'code' => ResponseCode::USER_LOGOUT_SUCCESS,
                    'message' => 'Logout successful',
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'message' => 'User not found',
                ], 404);
            }

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in logout: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh the access token
     *
     * Generates a new access token using the provided refresh token.
     * Supports both web and app platforms with different client credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function refreshToken(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'refresh_token' => 'required|string',
                'platform' => 'required|in:web,app',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $input = $validator->validated();

            $clientId = $input['platform'] === 'web'
                ? config('services.passport.web_client_id')
                : config('services.passport.app_client_id');

            $clientSecret = $input['platform'] === 'web'
                ? config('services.passport.web_client_secret')
                : config('services.passport.app_client_secret');

            $params = [
                'grant_type' => 'refresh_token',
                'refresh_token' => $input['refresh_token'],
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'scope' => '',
            ];

            $tokenRequest = Request::create('/oauth/token', 'POST', $params);
            $response = app()->handle($tokenRequest);

            if ($response->getStatusCode() !== 200) {
                $errorBody = json_decode($response->getContent(), true);

                ErrorLog::log([
                    'user_id' => null,
                    'error_message' => 'Token refresh failed',
                    'error_code' => ResponseCode::INVALID_CREDENTIALS,
                    'file_path' => __FILE__,
                    'class' => __CLASS__,
                    'function' => __FUNCTION__,
                    'line' => __LINE__,
                    'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                    'context' => json_encode([
                        'platform' => $input['platform'],
                        'status_code' => $response->getStatusCode(),
                        'error_response' => $errorBody['message'] ?? $errorBody['error'] ?? 'Unknown error',
                    ]),
                ]);

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::INVALID_CREDENTIALS,
                    'message' => 'Token refresh failed',
                    'errors' => $errorBody['message'] ?? $errorBody['error'] ?? 'Unknown error',
                ], $response->getStatusCode());
            }

            $tokenData = json_decode($response->getContent(), true);

            AuditLog::log([
                'user_id' => null,
                'module' => Module::AUTH_REFRESH_TOKEN,
                'action' => 'REFRESH_TOKEN_SUCCESS',
                'message' => 'Token refreshed successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'platform' => $input['platform'],
                    'expires_in' => $tokenData['expires_in'] ?? null,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::TOKEN_REFRESH_SUCCESS,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'],
                    'expires_in' => $tokenData['expires_in'],
                ],
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => null,
                'error_message' => 'Unexpected error in refreshToken: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'platform' => $request->platform ?? 'unknown',
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get authenticated user details
     *
     * Returns the currently logged-in user's profile information
     * including role, department, location details, and permissions.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function getUserProfile(Request $request)
    {
        try {
            $user = $request->user()->load([
                'role',
                'department',
                'country',
                'state',
                'city',
            ]);

            if (! $user) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'message' => 'User not found',
                    'data' => null,
                ], 404);
            }

            // Get user's permissions
            $permissions = [];
            if ($user->role && $user->role->permissions) {
                try {
                    $permissions = $user->role->permissions()
                        ->wherePivot('enabled', true)
                        ->pluck('key_name')
                        ->toArray();
                } catch (Exception $e) {
                    Log::warning('Failed to fetch permissions for user: '.$e->getMessage());
                    $permissions = [];

                    ErrorLog::log([
                        'user_id' => $user->id,
                        'error_message' => 'Failed to fetch permissions for user',
                        'error_code' => ResponseCode::SYSTEM_ERROR,
                        'file_path' => __FILE__,
                        'class' => __CLASS__,
                        'function' => __FUNCTION__,
                        'line' => __LINE__,
                        'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                        'context' => json_encode([
                            'email' => $user->email,
                            'error' => $e->getMessage(),
                        ]),
                    ]);
                }
            }

            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_GET_PROFILE,
                'action' => 'GET_PROFILE',
                'message' => 'User profile fetched successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'department_id' => $user->department_id,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $formattedUser = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role_id' => $user->role_id,
                'role_name' => $user->role ? $user->role->name : null,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'description' => $user->role->description,
                ] : null,
                'permissions' => $permissions,
                'department_id' => $user->department_id,
                'department_name' => $user->department ? $user->department->name : null,
                'country_id' => $user->country_id,
                'country_name' => $user->country ? $user->country->name : null,
                'state_id' => $user->state_id,
                'state_name' => $user->state ? $user->state->name : null,
                'city_id' => $user->city_id,
                'city_name' => $user->city ? $user->city->name : null,
                'address_line_1' => $user->address_line_1,
                'address_line_2' => $user->address_line_2,
                'address_line_3' => $user->address_line_3,
                'pincode' => $user->pincode,
                'status' => $user->status,
                'status_formatted' => $user->status == '1' ? 'Active' : 'Inactive',
                'dob' => $user->dob ? $user->dob->format('Y-m-d') : null,
                'email_verified' => $user->email_verified,
                'phone_verified' => $user->phone_verified,
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i:s') : null,
            ];

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::SUCCESS,
                'message' => 'User details fetched successfully',
                'data' => $formattedUser,
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in getUserProfile: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update authenticated user details
     *
     * Updates the currently logged-in user's profile information.
     * Only fields provided in the request will be updated.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function updateProfile(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'phone' => 'sometimes|required|string|max:20',
                'address_line_1' => 'sometimes|nullable|string|max:255',
                'address_line_2' => 'sometimes|nullable|string|max:255',
                'address_line_3' => 'sometimes|nullable|string|max:255',
                'city_id' => 'sometimes|nullable|exists:city,id',
                'state_id' => 'sometimes|nullable|exists:state,id',
                'country_id' => 'sometimes|nullable|exists:country,id',
                'pincode' => 'sometimes|nullable|string|max:255',
                'dob' => 'sometimes|nullable|date|before:'.now()->subYears(18)->format('Y-m-d'),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Get old values for audit log
            $oldValues = [];
            $newValues = [];

            if ($request->has('name') && $request->name != $user->name) {
                $oldValues['name'] = $user->name;
                $newValues['name'] = $request->name;
            }
            if ($request->has('phone') && $request->phone != $user->phone) {
                $oldValues['phone'] = $user->phone;
                $newValues['phone'] = $request->phone;
            }
            if ($request->has('address_line_1') && $request->address_line_1 != $user->address_line_1) {
                $oldValues['address_line_1'] = $user->address_line_1;
                $newValues['address_line_1'] = $request->address_line_1;
            }
            if ($request->has('address_line_2') && $request->address_line_2 != $user->address_line_2) {
                $oldValues['address_line_2'] = $user->address_line_2;
                $newValues['address_line_2'] = $request->address_line_2;
            }
            if ($request->has('address_line_3') && $request->address_line_3 != $user->address_line_3) {
                $oldValues['address_line_3'] = $user->address_line_3;
                $newValues['address_line_3'] = $request->address_line_3;
            }
            if ($request->has('city_id') && $request->city_id != $user->city_id) {
                $oldValues['city_id'] = $user->city_id;
                $newValues['city_id'] = $request->city_id;
            }
            if ($request->has('state_id') && $request->state_id != $user->state_id) {
                $oldValues['state_id'] = $user->state_id;
                $newValues['state_id'] = $request->state_id;
            }
            if ($request->has('country_id') && $request->country_id != $user->country_id) {
                $oldValues['country_id'] = $user->country_id;
                $newValues['country_id'] = $request->country_id;
            }
            if ($request->has('pincode') && $request->pincode != $user->pincode) {
                $oldValues['pincode'] = $user->pincode;
                $newValues['pincode'] = $request->pincode;
            }
            if ($request->has('dob') && $request->dob != $user->dob) {
                $oldValues['dob'] = $user->dob;
                $newValues['dob'] = $request->dob;
            }

            // If no changes, return early
            if (empty($newValues)) {
                return response()->json([
                    'status' => 'success',
                    'code' => ResponseCode::SUCCESS,
                    'message' => 'No changes to update',
                ], 200);
            }

            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->has('phone')) {
                $updateData['phone'] = $request->phone;
            }
            if ($request->has('address_line_1')) {
                $updateData['address_line_1'] = $request->address_line_1;
            }
            if ($request->has('address_line_2')) {
                $updateData['address_line_2'] = $request->address_line_2;
            }
            if ($request->has('address_line_3')) {
                $updateData['address_line_3'] = $request->address_line_3;
            }
            if ($request->has('city_id')) {
                $updateData['city_id'] = $request->city_id;
            }
            if ($request->has('state_id')) {
                $updateData['state_id'] = $request->state_id;
            }
            if ($request->has('country_id')) {
                $updateData['country_id'] = $request->country_id;
            }
            if ($request->has('pincode')) {
                $updateData['pincode'] = $request->pincode;
            }
            if ($request->has('dob')) {
                $updateData['dob'] = $request->dob;
            }

            $user->update($updateData);

            // AuditLog for successful profile update
            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_UPDATE_PROFILE,
                'action' => 'UPDATE_PROFILE',
                'message' => 'User profile updated successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => ! empty($oldValues) ? json_encode($oldValues) : null,
                'new_value' => json_encode($newValues),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::SUCCESS,
                'message' => 'Profile updated successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in updateProfile: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change user password
     *
     * Validates the current password and updates to a new password
     * for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required',
                'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::VALIDATION_FAILED,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'message' => 'User not found',
                ], 404);
            }

            if (! Hash::check($request->current_password, $user->password)) {
                AuditLog::log([
                    'user_id' => $user->id,
                    'module' => Module::AUTH_CHANGE_PASSWORD,
                    'action' => 'CHANGE_PASSWORD_FAILED',
                    'message' => 'Password change failed - Current password is incorrect',
                    'status' => AuditLog::STATUS_FAILED,
                    'old_value' => null,
                    'new_value' => json_encode([
                        'email' => $user->email,
                        'reason' => 'Invalid current password',
                    ]),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'code' => ResponseCode::INVALID_PASSWORD,
                    'message' => 'Current password is incorrect',
                ], 400);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            AuditLog::log([
                'user_id' => $user->id,
                'module' => Module::AUTH_CHANGE_PASSWORD,
                'action' => 'CHANGE_PASSWORD_SUCCESS',
                'message' => 'Password changed successfully',
                'status' => AuditLog::STATUS_SUCCESS,
                'old_value' => null,
                'new_value' => json_encode([
                    'email' => $user->email,
                    'password_changed_at' => now()->toDateTimeString(),
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'success',
                'code' => ResponseCode::PASSWORD_CHANGE_SUCCESS,
                'message' => 'Password changed successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'error_message' => 'Unexpected error in changePassword: '.$e->getMessage(),
                'error_code' => ResponseCode::SYSTEM_ERROR,
                'file_path' => __FILE__,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => __LINE__,
                'stack_trace' => json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => ResponseCode::SYSTEM_ERROR,
                'message' => 'Something went wrong',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }
}
