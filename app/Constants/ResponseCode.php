<?php

namespace App\Constants;

/**
 * Class ResponseCode
 *
 * Standard response codes used across the API.
 * These codes help identify exact API results
 * even when HTTP status codes are the same.
 *
 * Code Ranges:
 * 1000–1099 : General
 * 1100–1199 : Authentication
 * 1200–1299 : Client
 * 1300–1399 : User
 * 9000–9999 : System Errors
 *
 * @author Paramesh Guna
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class ResponseCode
{
    /*
    |--------------------------------------------------------------------------
    | General (1000–1099)
    |--------------------------------------------------------------------------
    */

    /** Request successful */
    const SUCCESS = 1000;

    /** Validation failed */
    const VALIDATION_FAILED = 1001;

    /** Resource not found */
    const NOT_FOUND = 1002;

    /** Unauthorized request */
    const UNAUTHORIZED = 1003;

    // Account locked due to multiple failed login attempts
    const ACCOUNT_LOCKED = 1004;

    /*
    |--------------------------------------------------------------------------
    | Authentication (1100–1199)
    |--------------------------------------------------------------------------
    */

    /** User not found */
    const USER_NOT_FOUND = 1101;

    /** Invalid password */
    const INVALID_PASSWORD = 1102;

    /** Invalid login credentials */
    const INVALID_CREDENTIALS = 1103;

    /** User login successful */
    const USER_LOGIN_SUCCESS = 1104;

    /** User logout successful */
    const USER_LOGOUT_SUCCESS = 1106;

    /** Token refreshed successfully */
    const TOKEN_REFRESH_SUCCESS = 1105;

    /*
    |--------------------------------------------------------------------------
    | Client (1200–1299)
    |--------------------------------------------------------------------------
    */

    /** Client not found */
    const CLIENT_NOT_FOUND = 1201;

    /** Client already exists */
    const CLIENT_ALREADY_EXISTS = 1202;

    /** Client login successful */
    const CLIENT_LOGIN_SUCCESS = 1203;

    /** Client session creation failed */
    const CLIENT_SESSION_CREATE_FAILED = 1204;

    /** Client token missing */
    const CLIENT_TOKEN_MISSING = 1205;

    /** Invalid client token */
    const CLIENT_TOKEN_INVALID = 1206;

    /** Client token expired */
    const CLIENT_TOKEN_EXPIRED = 1207;

    /** Client created successfully */
    const CLIENT_CREATED = 1208;

    /** Failed to create client */
    const CLIENT_CREATE_FAILED = 1209;

    /** Client logout successful */
    const CLIENT_LOGOUT_SUCCESS = 1210;

    /** Client logout failed */
    const CLIENT_LOGOUT_FAILED = 1211;

    /*
    |--------------------------------------------------------------------------
    | User (1300–1399)
    |--------------------------------------------------------------------------
    */

    /** User created successfully */
    const USER_CREATED = 1301;

    /** User updated successfully */
    const USER_UPDATED = 1302;

    /** User deleted successfully */
    const USER_DELETED = 1303;

    /*
    |--------------------------------------------------------------------------
    | System (9000–9999)
    |--------------------------------------------------------------------------
    */

    /** Internal server error */
    const SERVER_ERROR = 9000;

    /** Unexpected exception */
    const SYSTEM_ERROR = 9001;

    /*
|--------------------------------------------------------------------------
| OTP (2000–2099)
|--------------------------------------------------------------------------
*/

    /** OTP sent successfully */
    const OTP_SENT = 2000;

    /** OTP not found */
    const OTP_NOT_FOUND = 2001;

    /** OTP expired */
    const OTP_EXPIRED = 2002;

    /** OTP invalid (wrong token) */
    const OTP_INVALID = 2003;

    /** OTP max attempts reached */
    const OTP_MAX_ATTEMPTS = 2004;

    /** OTP verified successfully */
    const OTP_VERIFIED = 2005;

    const OTP_NOT_VERIFIED = 1024;

    const PASSWORD_RESET_SUCCESS = 1025;

    /**Email not verfied */
    const EMAIL_NOT_VERIFIED = 1026;

    /*
    |--------------------------------------------------------------------------
    | Password Management (1400–1499)  // ← Add this new section
    |--------------------------------------------------------------------------
    */
    /** Temporary password - needs to be changed */
    const PASSWORD_TEMPORARY = 1401;

    const PASSWORD_RESET_FAILED = 1402;

    const PASSWORD_CHANGE_SUCCESS = 1403;

    const PASSWORD_CHANGE_FAILED = 1404;
}
