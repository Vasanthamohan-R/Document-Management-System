<?php

namespace App\Models\Auth;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Otp extends Model
{
    use HasFactory;

    protected $table = 'otp';

    protected $fillable = [
        'user_id',
        'type',
        'purpose',
        'target',
        'otp',
        'status',
        'expires_at',
        'verified_at',
        'attempts',
        'wrong_attempts',
        'max_attempts',
    ];

    protected $casts = [
        'expires_at' => 'datetime:Y-m-d H:i:s',
        'verified_at' => 'datetime:Y-m-d H:i:s',
        'attempts' => 'integer',
        'wrong_attempts' => 'integer',
        'max_attempts' => 'integer',
    ];

    const STATUS_UNVERIFIED = 'unverified';

    const STATUS_VERIFIED = 'verified';

    const STATUS_EXPIRED = 'expired';

    const MAX_FALSE_ATTEMPTS = 3;

    const MAX_RESEND = 5;

    // Static properties to hold config values
    protected static $maxOtpResend = null;

    protected static $otpExpiryTime = null;

    /**
     * Get max OTP resend attempts from config
     */
    public static function getMaxOtpResend(): int
    {
        if (self::$maxOtpResend === null) {
            self::$maxOtpResend = (int) config('otp.max_attempts', 5);
        }

        return self::$maxOtpResend;
    }

    /**
     * Get OTP expiry time in minutes from config
     */
    public static function getOtpExpiryTime(): int
    {
        if (self::$otpExpiryTime === null) {
            self::$otpExpiryTime = (int) config('otp.expiry_minutes', 2);
        }

        return self::$otpExpiryTime;
    }

    /**
     * Create initial OTP record (first send).
     * Attempts start at 1 (first send counts as attempt).
     */
    public static function createInitial(
        int $userId,
        string $type,
        string $target,
        string $purpose,
        // int $maxAttempts = config('otp.max_attempts', 5),
        // int $expiryMinutes = config('otp.expiry_minutes', 2)
    ): self {
        Log::info('OTP generation started', [
            'user_id' => $userId,
            'type' => $type,
            'target' => $target,
            'purpose' => $purpose,
        ]);

        $otp = self::generateUniqueOtp($userId, $type, $target, $purpose);

        Log::info('OTP generated successfully', [
            'user_id' => $userId,
            'otp' => $otp,
        ]);

        $otpRecord = self::create([
            'user_id' => $userId,
            'type' => $type,
            'purpose' => $purpose,
            'target' => $target,
            'otp' => $otp,
            'status' => self::STATUS_UNVERIFIED,
            'expires_at' => Carbon::now()->addMinutes(self::getOtpExpiryTime()),
            'attempts' => 1,
            'max_attempts' => self::getMaxOtpResend(),
        ]);

        Log::info('OTP record created', [
            'otp_id' => $otpRecord->id,
            'expires_at' => $otpRecord->expires_at,
        ]);

        return $otpRecord;
    }

    /**
     * Generate a 6-digit OTP that does not already exist.
     */
    private static function generateUniqueOtp(int $userId, string $type, string $target, string $purpose): string
    {
        do {
            $otp = (string) random_int(100000, 999999);
            $exists = self::where('user_id', $userId)
                ->where('type', $type)
                ->where('target', $target)
                ->where('purpose', $purpose)
                ->where('status', self::STATUS_UNVERIFIED)
                ->where('otp', $otp)
                ->exists();
        } while ($exists);

        return $otp;
    }

    /**
     * Get the latest unverified OTP for a user and purpose.
     */
    public static function latestUnverified(int $userId, string $purpose, ?string $type = null, ?string $target = null): ?self
    {
        $query = self::where('user_id', $userId)
            ->where('purpose', $purpose)
            ->where('status', self::STATUS_UNVERIFIED);

        if ($type) {
            $query->where('type', $type);
        }
        if ($target) {
            $query->where('target', $target);
        }

        return $query->latest('id')->first();
    }

    /**
     * Check if the OTP is expired.
     */
    public function isExpired(): bool
    {
        $expired = Carbon::now()->greaterThan($this->expires_at);
        if ($expired && $this->status !== self::STATUS_EXPIRED) {
            $this->update(['status' => self::STATUS_EXPIRED]);
        }

        return $expired;
    }

    /**
     * Check if max attempts reached.
     */
    public function hasReachedMaxAttempts(): bool
    {
        return $this->attempts >= $this->max_attempts;
    }

    /**
     * Determine if a resend is allowed.
     */
    // public function canResend(): bool
    // {
    //     if ($this->status === self::STATUS_VERIFIED) {
    //         return false;
    //     }

    //     if (! $this->hasReachedMaxAttempts()) {
    //         return true;
    //     }

    //     $twentyFourHoursLater = $this->created_at->copy()->addHours(24);
    //     $now = Carbon::now();

    //     if ($now->gt($twentyFourHoursLater)) {
    //         return true;
    //     }

    //     return false;
    // }

    /**
     * Perform a resend.
     */
    public function resend(): string|false
    {
        $now = Carbon::now('UTC');
        $expiryMinutes = (int) config('otp.expiry_minutes', 10);
        $cooldownHours = (int) config('otp.cooldown_hours', 24);

        // Cannot resend verified OTPs
        if ($this->status === self::STATUS_VERIFIED) {
            Log::info('Cannot resend verified OTP', ['id' => $this->id]);

            return false;
        }

        // Check if max attempts reached and still in cooldown period
        if ($this->hasReachedMaxAttempts()) {
            $cooldownEndsAt = $this->created_at->copy()->addHours($cooldownHours);

            if ($now->lte($cooldownEndsAt)) {
                Log::info('Resend blocked: Cooldown active until '.$cooldownEndsAt, [
                    'id' => $this->id,
                    'attempts' => $this->attempts,
                    'max_attempts' => $this->max_attempts,
                ]);

                return false;
            }

            // Cooldown passed - create fresh OTP
            Log::info('Cooldown passed, creating fresh OTP', ['old_id' => $this->id]);
            $newOtp = self::createInitial(
                $this->user_id, $this->type, $this->target,
                $this->purpose,
            );
            $this->update(['status' => self::STATUS_EXPIRED]);

            return $newOtp->otp;
        }

        // Handle expired OTP - create new record
        if ($this->isExpired()) {
            Log::info('OTP expired, creating new record', ['old_id' => $this->id]);
            $newOtp = self::create([
                'user_id' => $this->user_id,
                'type' => $this->type,
                'purpose' => $this->purpose,
                'target' => $this->target,
                'otp' => self::generateUniqueOtp($this->user_id, $this->type, $this->target, $this->purpose),
                'status' => self::STATUS_UNVERIFIED,
                'expires_at' => $now->copy()->addMinutes($expiryMinutes),
                'attempts' => $this->attempts + 1,
                'max_attempts' => $this->max_attempts,
            ]);
            $this->update(['status' => self::STATUS_EXPIRED]);

            return $newOtp->otp;
        }

        // Resend same OTP (not expired, max attempts not reached)
        Log::info('Resending same OTP', ['id' => $this->id, 'attempt' => $this->attempts + 1]);
        $this->attempts += 1;
        $this->created_at = $now;
        $this->updated_at = $now;
        $this->expires_at = $now->copy()->addMinutes($expiryMinutes);
        $this->save();

        return $this->otp;
    }

    /**
     * Increment attempt counter.
     */
    public function incrementAttempt(): void
    {
        $this->increment('attempts');
        if ($this->hasReachedMaxAttempts() && $this->status === self::STATUS_UNVERIFIED) {
            $this->update(['status' => self::STATUS_EXPIRED]);
        }
    }

    /**
     * Mark the OTP as verified.
     */
    public function markAsVerified(): void
    {
        $this->status = self::STATUS_VERIFIED;
        $this->verified_at = Carbon::now();
        $this->save();

        Log::info('OTP marked as verified', [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'purpose' => $this->purpose,
            'verified_at' => $this->verified_at,
        ]);
    }
}
