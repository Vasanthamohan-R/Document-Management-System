<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OTP Maximum Attempts
    |--------------------------------------------------------------------------
    |
    | Maximum number of OTP requests allowed before rate limiting kicks in.
    |
    */
    'max_attempts' => env('OTP_MAX_ATTEMPTS', 5),

    /*
    |--------------------------------------------------------------------------
    | OTP Expiry Minutes
    |--------------------------------------------------------------------------
    |
    | Number of minutes after which the OTP will expire.
    |
    */
    'expiry_minutes' => env('OTP_EXPIRY_MINUTES', 2),
    /*
    |--------------------------------------------------------------------------
    | Rate Limit Cooldown Hours
    |--------------------------------------------------------------------------
    |
    | Number of hours to block OTP requests after exceeding max attempts.
    |
    */
    'cooldown_hours' => env('OTP_COOLDOWN_HOURS', 24),
];
