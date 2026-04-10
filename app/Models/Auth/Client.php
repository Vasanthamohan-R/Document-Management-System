<?php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

/**
 * Class Client
 *
 * Model representing API Clients that can access the system.
 * Each client may have multiple active sessions.
 *
 *
 * @author Paramesh Guna
 *
 * @created 05-03-2026
 *
 * @version 1.0
 */
class Client extends Model
{
    use HasFactory;

    /**
     * Table associated with the model
     *
     * @var string
     */
    protected $table = 'client';

    /**
     * Mass assignable attributes
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'client_id',
        'client_secret',
        'expires_in',
        'status',
    ];

    /**
     * Get all sessions related to the client
     *
     * Relationship:
     * One Client -> Many Client Sessions
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     *
     * @since 1.0.0
     */
    public function sessions()
    {
        return $this->hasMany(ClientSession::class, 'client_id');
    }

    /**
     * Generate a unique random Client ID
     *
     * Generates a secure random client ID and ensures
     * it does not already exist in the database.
     *
     *
     * @throws \Exception
     *
     * @since 1.0.0
     */
    public static function generateClientId(): string
    {
        try {

            do {
                $clientId = strtoupper(bin2hex(random_bytes(8)));
            } while (self::where('client_id', $clientId)->exists());

            return $clientId;

        } catch (\Throwable $e) {

            Log::error('Client ID generation failed', [
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Unable to generate client ID');
        }
    }

    /**
     * Generate a unique random Client Secret
     *
     * Generates a secure random client secret and ensures
     * it does not already exist in the database.
     *
     *
     * @throws \Exception
     *
     * @since 1.0.0
     */
    public static function generateClientSecret(): string
    {
        try {

            do {
                $clientSecret = strtoupper(bin2hex(random_bytes(16)));
            } while (self::where('client_secret', $clientSecret)->exists());

            return $clientSecret;

        } catch (\Throwable $e) {

            Log::error('Client secret generation failed', [
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Unable to generate client secret');
        }
    }
}
