<?php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ClientSession
 *
 * This model handles client session management.
 * It stores authentication token, IP address, user agent,
 * session expiry and status for API clients.
 *
 * Table: client_session
 *
 * @author Paramesh Guna
 *
 * @created 2026-03-05
 *
 * @since 1.0.0
 *
 * @version 1.0
 */
class ClientSession extends Model
{
    use HasFactory;

    /**
     * Table associated with the model
     *
     * @var string
     */
    protected $table = 'client_session';

    /**
     * Mass assignable attributes
     *
     * These fields are allowed for mass assignment
     * while creating or updating session records.
     *
     * @var array
     */
    protected $fillable = [
        'client_id',
        'ip_address',
        'user_agent',
        'token',
        'expires_in',
        'status',
    ];

    /**
     * Get the client associated with this session
     *
     * Relationship:
     * Many Sessions -> One Client
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     *
     * @since 1.0.0
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
