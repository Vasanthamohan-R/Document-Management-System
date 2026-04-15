<?php

use App\Http\Controllers\Public\RoleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v1', 'namespace' => 'App\Http\Controllers'], function () {

    // --- Public / Client Routes ---
    Route::post('contact/store', 'Public\ContactController@store')->name('contact.store');

    Route::prefix('client')->group(function () {
        Route::post('token/generate', 'Auth\ClientAuthController@tokenGenerate')->name('v1.client.token.generate');
        Route::post('create', 'Auth\ClientAuthController@create')->name('v1.client.create');
    });

    // --- Master Data ---
    Route::post('country', 'Public\MasterDataController@getCountry')->name('get-country');
    Route::post('state', 'Public\MasterDataController@getState')->name('get-state');
    Route::post('city', 'Public\MasterDataController@getCity')->name('get-city');
    Route::post('department', 'Public\MasterDataController@getDepartment')->name('get-department');
    Route::post('roles', 'Public\MasterDataController@getRoles')->name('get-roles');

    // --- Authentication ---
    Route::group(['prefix' => 'auth'], function () {

        Route::middleware('client')->group(function () {
            Route::post('register', 'Auth\AuthController@register')->name('register');
            Route::post('login', 'Auth\AuthController@login')->name('login');
            Route::post('password-request', 'Auth\AuthController@forgotPassword')->name('password.request');
            Route::post('password-reset', 'Auth\AuthController@resetPassword')->name('reset-password');
            Route::post('verify-otp', 'Auth\AuthController@verifyOtp')->name('verify.otp');
            Route::post('resend-otp', 'Auth\AuthController@resendOtp')->name('resend.otp');
        });

        Route::middleware('auth:api')->group(function () {
            // Profile & Session
            Route::post('token-refresh', 'Auth\AuthController@refreshToken')->name('refresh');
            Route::post('profile-view', 'Auth\AuthController@getUserprofile')->name('user');
            Route::post('profile-update', 'Auth\AuthController@updateProfile')->name('profile.update');
            Route::post('password-change', 'Auth\AuthController@changePassword')->name('change-password');
            Route::post('logout', 'Auth\AuthController@logout')->name('logout');

            // Logs
            Route::post('audit-logs', 'Public\AuditLogController@index')->middleware('permission:audit.view');
            Route::post('contact-logs', 'Public\ContactController@displaycontact')->middleware('permission:contact.view');

            // User Management
            Route::middleware('permission:users.view')->group(function () {
                Route::post('user-list', 'Admin\UserController@index')->name('users.index');
                Route::post('user-create', 'Admin\UserController@store')->middleware('permission:users.create')->name('users.store');
                Route::post('user-update', 'Admin\UserController@updateUserById')->middleware('permission:users.edit')->name('users.update');
                Route::post('user-delete', 'Admin\UserController@deleteUserById')->middleware('permission:users.delete')->name('users.destroy');
            });

            // Role Management
            Route::middleware('permission:roles.view')->group(function () {
                Route::post('role-list', [RoleController::class, 'index']);
                Route::post('role-view', [RoleController::class, 'show']);
                Route::post('role-create', [RoleController::class, 'store'])->middleware('permission:roles.create');
                Route::post('role-update', [RoleController::class, 'update'])->middleware('permission:roles.edit');
                Route::post('role-delete', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
                Route::get('permission-list', [RoleController::class, 'permissions']);
                Route::post('permission-sync', [RoleController::class, 'syncPermissions'])->middleware('permission:roles.edit');
                Route::post('role-users', [RoleController::class, 'getRoleUsers']);
            });

        });
    });
});
