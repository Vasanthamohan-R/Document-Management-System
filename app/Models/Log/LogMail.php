<?php

namespace App\Models\Log;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class MailLog
 *
 * Logs all email communications sent through the system
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-04-06
 *
 * @version 1.0
 */
class LogMail extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'log_mails';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'recepient_mail',
        'system_mail',
        'message',
        'user_agent',
        'ip_address',
        'sent_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sent_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Status Constants
     */
    const STATUS_PENDING = 'pending';

    const STATUS_SENT = 'sent';

    const STATUS_FAILED = 'failed';

    const STATUS_QUEUED = 'queued';

    /**
     * Get the user that owns the mail log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope a query to only include sent mails.
     */
    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    /**
     * Scope a query to only include failed mails.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope a query to only include pending mails.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to filter by recipient email.
     */
    public function scopeByRecipient($query, $email)
    {
        return $query->where('recepient_mail', $email);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('sent_at', [$startDate, $endDate]);
    }

    /**
     * Get formatted status with badge.
     */
    public function getFormattedStatusAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SENT => '<span class="badge badge-success">Sent</span>',
            self::STATUS_FAILED => '<span class="badge badge-danger">Failed</span>',
            self::STATUS_PENDING => '<span class="badge badge-warning">Pending</span>',
            self::STATUS_QUEUED => '<span class="badge badge-info">Queued</span>',
            default => '<span class="badge badge-secondary">Unknown</span>',
        };
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SENT => 'Sent',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_PENDING => 'Pending',
            self::STATUS_QUEUED => 'Queued',
            default => 'Unknown',
        };
    }

    /**
     * Log a mail entry
     */
    public static function log(array $data): self
    {
        return self::create([
            'user_id' => $data['user_id'] ?? null,
            'name' => $data['name'] ?? null,
            'recepient_mail' => $data['recepient_mail'] ?? null,
            'system_mail' => $data['system_mail'] ?? null,
            'message' => $data['message'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'ip_address' => $data['ip_address'] ?? null,
            'sent_at' => $data['sent_at'] ?? now(),
            'status' => $data['status'] ?? self::STATUS_PENDING,
        ]);
    }

    /**
     * Mark mail as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark mail as failed
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
        ]);
    }
}
