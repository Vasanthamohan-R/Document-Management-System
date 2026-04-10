<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /**
     * Passport Services Configuration
     *
     * Stores OAuth client credentials used by Laravel Passport
     * for different platforms (Web and Mobile App).
     *
     * @author Paramesh Guna
     *
     * @created 2026-03-05
     *
     * @version 1.0
     */
    'passport' => [
        'web_client_id' => env('PASSPORT_WEB_CLIENT_ID'),
        'web_client_secret' => env('PASSPORT_WEB_CLIENT_SECRET'),

        'app_client_id' => env('PASSPORT_APP_CLIENT_ID'),
        'app_client_secret' => env('PASSPORT_APP_CLIENT_SECRET'),
    ],

];
