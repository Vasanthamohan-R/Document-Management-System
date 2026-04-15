<?php

// app/Models/AuditLog.php

namespace App\Models\Log;

use App\Models\Auth\Client;
use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'audit_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'user_id',
        'module',
        'action',
        'message',
        'status',
        'ip_address',
        'old_value',
        'new_value',
        'custom1',
        'custom2',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'client_id' => 'integer',
        'user_id' => 'integer',
        'module' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Status constants
     */
    const STATUS_SUCCESS = '1';

    const STATUS_FAILED = '2';

    const STATUS_PENDING = '3';

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SUCCESS => 'Success',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_PENDING => 'Pending',
            default => 'Unknown',
        };
    }

    /**
     * Get status color class
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_SUCCESS => 'green',
            self::STATUS_FAILED => 'red',
            self::STATUS_PENDING => 'yellow',
            default => 'gray',
        };
    }

    /**
     * Get the client that owns the audit log.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    /**
     * Get the user that owns the audit log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope a query to get logs by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to get success logs.
     */
    public function scopeSuccess($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope a query to get failed logs.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope a query to get pending logs.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to get logs by module.
     */
    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope a query to get logs by action.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to get logs for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to get logs for a specific client.
     */
    public function scopeForClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Log an action (Helper method)
     */
    public static function log(array $data): self
    {
        $userId = Auth::id();

        // ✅ Get hex value from config
        $clientHex = config('app.client_id');

        // ✅ Find the integer ID from clients table using hex value

        $client = Client::where('client_id', $clientHex)->first();

        $clientId = $client ? $client->id : null;

        return self::create([
            'client_id' => $clientId ?? null,
            'user_id' => $data['user_id'] ?? $userId,
            'module' => $data['module'] ?? null,
            'action' => $data['action'] ?? null,
            'message' => $data['message'] ?? null,
            'status' => $data['status'] ?? self::STATUS_PENDING,
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'old_value' => $data['old_value'] ?? null,
            'new_value' => $data['new_value'] ?? null,
            'custom1' => $data['custom1'] ?? null,
            'custom2' => $data['custom2'] ?? null,
        ]);
    }

    /**
     * Log a success action
     */
    public static function logSuccess(array $data): self
    {
        $data['status'] = self::STATUS_SUCCESS;

        return self::log($data);
    }

    /**
     * Log a failed action
     */
    public static function logFailure(array $data): self
    {
        $data['status'] = self::STATUS_FAILED;

        return self::log($data);
    }

    /**
     * Log a pending action
     */
    public static function logPending(array $data): self
    {
        $data['status'] = self::STATUS_PENDING;

        return self::log($data);
    }
}
