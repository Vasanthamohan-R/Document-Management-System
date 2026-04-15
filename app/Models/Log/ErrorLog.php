<?php

namespace App\Models\Log;

use App\Models\Auth\Client;
use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ErrorLog extends Model
{
    use HasFactory;

    protected $table = 'error_logs';

    protected $fillable = [
        'client_id',
        'user_id',
        'error_message',
        'error_code',
        'file_path',
        'class',
        'function',
        'line',
        'stack_trace',
        'context',
        'ip_address',
        'url',
        'method',
        'user_agent',
    ];

    protected $casts = [
        'context' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scopes
    public function scopeByErrorCode($query, $code)
    {
        return $query->where('error_code', $code);
    }

    public function scopeByClass($query, $class)
    {
        return $query->where('class', $class);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper method to log errors
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
            'error_message' => $data['error_message'] ?? null,
            'error_code' => $data['error_code'] ?? null,
            'file_path' => $data['file_path'] ?? null,
            'class' => $data['class'] ?? null,
            'function' => $data['function'] ?? null,
            'line' => $data['line'] ?? null,
            'stack_trace' => $data['stack_trace'] ?? null,
            'context' => $data['context'] ?? null,
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'url' => $data['url'] ?? request()->fullUrl(),
            'method' => $data['method'] ?? request()->method(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
        ]);
    }
}
