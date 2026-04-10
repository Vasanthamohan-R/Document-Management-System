<?php

use App\Http\Controllers\Public\RoleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (Versioned)
|--------------------------------------------------------------------------
|
| All API routes are versioned under /api/v1. This allows multiple API
| versions to coexist and simplifies maintenance.
|
| API Version: v1
| API Base URL: /api/v1
|
*/

Route::group(['prefix' => 'v1', 'namespace' => 'App\Http\Controllers'], function () {

    // Contact Form Route
    Route::post('contact/store', 'Public\ContactController@store')->name('contact form submission');

    /**
     * ------------------------------------------------
     * Client Authentication Routes
     * ------------------------------------------------
     */
    Route::prefix('client')->group(function () {
        Route::post('token/generate', 'Auth\ClientAuthController@tokenGenerate')
            ->name('v1.client.token.generate');
        Route::post('create', 'Auth\ClientAuthController@create')
            ->name('v1.client.create');
    });

    /**
     * ------------------------------------------------
     * User Authentication Routes
     * ------------------------------------------------
     */
    Route::group(['prefix' => 'auth'], function () {

        Route::middleware('client')->group(function () {
            Route::post('register', 'Auth\AuthController@register')->name('register');
            Route::post('login', 'Auth\AuthController@login')->name('login');
            Route::post('password/request', 'Auth\AuthController@forgotPassword')->name('password.request');
            Route::post('password/reset', 'Auth\AuthController@resetPassword')->name('reset-password');
            Route::post('verify-otp', 'Auth\AuthController@verifyOtp')->name('verify.otp');
            Route::post('resend-otp', 'Auth\AuthController@resendOtp')->name('resend.otp');
        });

        Route::middleware('auth:api')->group(function () {
            Route::post('refresh/token', 'Auth\AuthController@refreshToken')->name('refresh');
            Route::post('profile', 'Auth\AuthController@getUserprofile')->name('user');
            Route::post('logout', 'Auth\AuthController@logout')->name('logout');
            Route::post('profile/update', 'Auth\AuthController@updateProfile')->name('profile.update');
            Route::post('change/password', 'Auth\AuthController@changePassword')->name('change-password');

            /**
             * ------------------------------------------------
             * Contact Logs
             * ------------------------------------------------
             */
            Route::post('/contact-logs', 'Public\ContactController@displaycontact')->middleware('permission:contact.view');

            /**
             * ------------------------------------------------
             * Audit Logs
             * ------------------------------------------------
             */
            Route::post('/audit-logs', 'Public\AuditLogController@index')->middleware('permission:audit.view');

            /**
             * ------------------------------------------------
             * User Management Routes
             * ------------------------------------------------
             */
            Route::prefix('user-management')->middleware('permission:users.view')->group(function () {
                Route::post('/list', 'Admin\UserController@index')->name('users.index');
                Route::post('/create', 'Admin\UserController@store')->middleware('permission:users.create')->name('users.store');
                Route::post('/update/{id}', 'Admin\UserController@updateUserById')->middleware('permission:users.edit')->name('users.update');
                Route::post('/delete/{id}', 'Admin\UserController@deleteUserById')->middleware('permission:users.delete')->name('users.destroy');
            });

            /**
             * ------------------------------------------------
             * Role Management Routes
             * ------------------------------------------------
             */
            Route::prefix('roles')->middleware('permission:roles.view')->group(function () {
                Route::get('/permissions', [RoleController::class, 'permissions']);
                Route::post('/permissions/sync', [RoleController::class, 'syncPermissions'])->middleware('permission:roles.edit');
                Route::post('/list', [RoleController::class, 'index']);
                Route::post('/users', [RoleController::class, 'getRoleUsers']);
                Route::post('/create', [RoleController::class, 'store'])->middleware('permission:roles.create');
                Route::post('/view', [RoleController::class, 'show']);
                Route::post('/update', [RoleController::class, 'update'])->middleware('permission:roles.edit');
                Route::post('/delete', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
            });

        });
    });

    /**
     * ------------------------------------------------
     * Masterdata Routes
     * ------------------------------------------------
     */
    Route::post('country', 'Public\MasterDataController@getCountry')->name('get-country');
    Route::post('state', 'Public\MasterDataController@getState')->name('get-state');
    Route::post('city', 'Public\MasterDataController@getCity')->name('get-city');
    Route::post('department', 'Public\MasterDataController@getDepartment')->name('get-department');
    Route::post('roles', 'Public\MasterDataController@getRoles')->name('get-roles');

});
