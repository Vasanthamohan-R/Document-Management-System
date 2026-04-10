<?php

namespace App\Services;

use App\Constants\ResponseCode;
use App\Mail\OtpMail;
use App\Models\Auth\User;
use App\Models\Otp;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    /**
     * Send an OTP (initial or resend) to the given identifier (email).
     */
    public function sendOtp(string $identifier, string $purpose): array
    {
        try {
            $user = User::where('email', $identifier)->first();
            if (! $user) {
                return [
                    'status' => 'error',
                    'message' => 'User not found with this email',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'http_code' => 404,
                    'expires_at' => null,
                ];
            }

            $type = 'email';
            $target = $identifier;
            $otpRecord = null;

            Log::info('OTP send request received', [
                'user_id' => $user->id,
                'type' => $type,
                'target' => $target,
                'purpose' => $purpose,
            ]);

            // Look for existing unverified OTP
            $existingOtp = Otp::latestUnverified($user->id, $purpose, $type, $target);

            Log::info('Existing OTP check', [
                'user_id' => $user->id,
                'purpose' => $purpose,
                'type' => $type,
                'target' => $target,
                'existing_otp_id' => $existingOtp ? $existingOtp->id : null,
            ]);

            if (! $existingOtp) {
                // Create initial OTP
                $otpRecord = Otp::createInitial(
                    $user->id,
                    $type,
                    $target,
                    $purpose,
                    // $this->maxAttempts,
                    // $this->expiryMinutes
                );
                $otpToSend = $otpRecord->otp;
            } else {
                // Handle resend using model's resend() method
                $otpToSend = $existingOtp->resend();

                if ($otpToSend === false) {
                    return [
                        'status' => 'error',
                        'message' => 'You have exceeded the OTP request limit. Please try again after 24 hours.',
                        'code' => ResponseCode::OTP_MAX_ATTEMPTS,
                        'http_code' => 429,
                        'expires_at' => null,
                    ];
                }

                // Get the latest OTP record after resend
                $otpRecord = Otp::latestUnverified($user->id, $purpose, $type, $target);

                if (! $otpRecord) {
                    return [
                        'status' => 'error',
                        'message' => 'Failed to retrieve OTP record',
                        'code' => ResponseCode::SYSTEM_ERROR,
                        'http_code' => 500,
                        'expires_at' => null,
                    ];
                }
            }

            // Send the OTP via appropriate channel
            $this->sendOtpNotification($user, $otpToSend, $purpose);

            // Get expiry timestamp
            $expiresAt = null;
            if ($otpRecord && $otpRecord->expires_at) {
                if ($otpRecord->expires_at instanceof \Carbon\Carbon) {
                    $expiresAt = $otpRecord->expires_at->timestamp;
                } else {
                    $expiresAt = strtotime($otpRecord->expires_at);
                }
            }

            return [
                'status' => 'success',
                'message' => 'OTP sent successfully',
                'code' => ResponseCode::OTP_SENT,
                'http_code' => 200,
                'expires_at' => $expiresAt,
            ];

        } catch (Exception $e) {
            Log::error('OTP sending failed: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'status' => 'error',
                'message' => 'Failed to send OTP',
                'code' => ResponseCode::SYSTEM_ERROR,
                'http_code' => 500,
                'expires_at' => null,
            ];
        }
    }

    /**
     * Verify the OTP.
     */
    public function verifyOtp(string $identifier, string $token, string $purpose): array
    {
        try {
            $user = User::where('email', $identifier)->first();

            if (! $user) {
                return [
                    'status' => 'error',
                    'message' => 'User not found',
                    'code' => ResponseCode::USER_NOT_FOUND,
                    'http_code' => 404,
                ];
            }

            $otp = Otp::where('user_id', $user->id)
                ->where('type', 'email')
                ->where('target', $identifier)
                ->where('purpose', $purpose)
                ->where('status', Otp::STATUS_UNVERIFIED)
                ->latest()
                ->first();

            if (! $otp) {
                return [
                    'status' => 'error',
                    'message' => 'OTP not found or already verified',
                    'code' => ResponseCode::OTP_NOT_FOUND,
                    'http_code' => 404,
                ];
            }

            $cooldownHours = 24;

            // ===============================
            // 🔄 RESET ATTEMPTS AFTER 24 HOURS (Do this FIRST)
            // ===============================
            if (
                $otp->wrong_attempts >= Otp::MAX_FALSE_ATTEMPTS &&
                now()->gte($otp->updated_at->copy()->addHours($cooldownHours))
            ) {
                $otp->wrong_attempts = 0;
                $otp->save();
                $otp->refresh(); // Refresh to get updated values
            }

            // ===============================
            // 🔒 LOCK CHECK (24 hours)
            // ===============================
            if (
                $otp->wrong_attempts >= Otp::MAX_FALSE_ATTEMPTS &&
                now()->lt($otp->updated_at->copy()->addHours($cooldownHours))
            ) {
                // Calculate remaining lock time
                $lockedUntil = $otp->updated_at->copy()->addHours($cooldownHours);
                $hoursRemaining = ceil(now()->diffInHours($lockedUntil, false));

                return [
                    'status' => 'error',
                    'message' => "Maximum attempts reached. Try again after {$hoursRemaining} hours.",
                    'code' => ResponseCode::OTP_MAX_ATTEMPTS,
                    'http_code' => 429,
                    'locked_until' => $lockedUntil->toDateTimeString(),
                    'hours_remaining' => max(1, $hoursRemaining),
                ];
            }

            // ===============================
            // ⏳ EXPIRY CHECK
            // ===============================
            if ($otp->isExpired()) {
                return [
                    'status' => 'error',
                    'message' => 'OTP has expired',
                    'code' => ResponseCode::OTP_EXPIRED,
                    'http_code' => 410,
                ];
            }

            // ===============================
            // ❌ WRONG OTP
            // ===============================
            if ($otp->otp !== $token) {
                $otp->increment('wrong_attempts');
                $otp->refresh();

                // 🔒 JUST REACHED MAX - Now locked for 24 hours
                if ($otp->wrong_attempts >= Otp::MAX_FALSE_ATTEMPTS) {
                    return [
                        'status' => 'error',
                        'message' => 'Maximum attempts reached. Account locked for 24 hours.',
                        'code' => ResponseCode::OTP_MAX_ATTEMPTS,
                        'http_code' => 429,
                        'locked_for_hours' => $cooldownHours,
                    ];
                }

                $remainingAttempts = Otp::MAX_FALSE_ATTEMPTS - $otp->wrong_attempts;

                return [
                    'status' => 'error',
                    'message' => 'Invalid OTP',
                    'code' => ResponseCode::OTP_INVALID,
                    'http_code' => 400,
                    'remaining_attempts' => $remainingAttempts,
                    'attempts_used' => $otp->wrong_attempts,
                    'max_attempts' => Otp::MAX_FALSE_ATTEMPTS,
                ];
            }

            // ===============================
            // ✅ SUCCESS
            // ===============================
            // Reset wrong attempts first
            $otp->wrong_attempts = 0;
            $otp->markAsVerified(); // Make sure this method doesn't override wrong_attempts

            if ($purpose === 'registration') {
                $user->email_verified = 2;
                $user->email_verified_at = now();
                $user->save();
            }

            return [
                'status' => 'success',
                'message' => 'OTP verified successfully',
                'code' => ResponseCode::OTP_VERIFIED,
                'http_code' => 200,
            ];

        } catch (Exception $e) {
            Log::error('OTP verification failed: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return [
                'status' => 'error',
                'message' => 'Failed to verify OTP',
                'code' => ResponseCode::SYSTEM_ERROR,
                'http_code' => 500,
            ];
        }
    }

    /**
     * Send the OTP via appropriate channel.
     */
    protected function sendOtpNotification(User $user, string $otpToken, string $purpose): void
    {
        Mail::to($user->email)->send(new OtpMail($user, $otpToken, $purpose));
    }
}
