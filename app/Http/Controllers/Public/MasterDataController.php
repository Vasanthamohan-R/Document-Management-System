<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Location\City;
use App\Models\Location\Country;
use App\Models\Location\State;
use App\Models\Log\AuditLog;
use App\Models\Log\ErrorLog;
use App\Models\Permission\Module;
use App\Models\Permission\Role;
use Exception;
use Illuminate\Support\Facades\Auth;

/**
 * Class MasterDataController
 *
 * Handles retrieval of master data including countries, states, cities,
 * departments, and roles for dropdowns and reference data.
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class MasterDataController extends Controller
{
    /**
     * Get Country
     *
     * Retrieves all active countries from the database.
     * Returns id, name, alpha_2, and alpha_3 fields ordered by name.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function getCountry()
    {
        try {
            $data = Country::where('is_active', true)
                ->select('id', 'name', 'alpha_2', 'alpha_3')
                ->orderBy('name')
                ->get();
            AuditLog::log([
                'module' => Module::SETTINGS,
                'action' => 'VIEW_COUNTRIES',
                'message' => 'User viewed countries list',
                'user_id' => $userId ?? null,
                'custom1' => json_encode([
                    'total_records' => $data->count(),
                    'retrieved_at' => now()->toDateTimeString(),
                ]),
                'custom2' => 'IP: '.request()->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'message' => 'Countries retrieved successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => Auth::id() ?? null,
                'error_message' => 'Failed to fetch countries: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch countries',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get State
     *
     * Retrieves all active states from the database.
     * Returns id, country_id, name, and code fields ordered by name.
     * Frontend will filter states based on selected country_id.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function getState()
    {
        try {
            $data = State::where('is_active', true)
                ->select('id', 'country_id', 'name', 'code')
                ->orderBy('name')
                ->get();

            AuditLog::log([
                'module' => Module::SETTINGS,
                'action' => 'VIEW_STATES',
                'message' => 'User viewed states list',
                'user_id' => $userId ?? null,
                'custom1' => json_encode([
                    'total_records' => $data->count(),
                    'retrieved_at' => now()->toDateTimeString(),
                ]),
                'custom2' => 'IP: '.request()->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'message' => 'States retrieved successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => Auth::id() ?? null,
                'error_message' => 'Failed to fetch states: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch states',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get City
     *
     * Retrieves all active cities from the database.
     * Returns id, country_id, state_id, name, and code fields ordered by name.
     * Frontend will filter cities based on selected state_id.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function getCity()
    {
        try {
            $data = City::where('is_active', true)
                ->select('id', 'country_id', 'state_id', 'name', 'code')
                ->orderBy('name')
                ->get();

            AuditLog::log([
                'module' => Module::SETTINGS,
                'action' => 'VIEW_CITIES',
                'message' => 'User viewed cities list',
                'user_id' => $userId ?? null,
                'custom1' => json_encode([
                    'total_records' => $data->count(),
                    'retrieved_at' => now()->toDateTimeString(),
                ]),
                'custom2' => 'IP: '.request()->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'message' => 'Cities retrieved successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => Auth::id() ?? null,
                'error_message' => 'Failed to fetch cities: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch cities',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get Department
     *
     * Returns all active departments.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function getDepartment()
    {
        try {
            $data = Department::where('status', '1')
                ->select('id', 'name', 'description')
                ->orderBy('name')
                ->get();

            AuditLog::log([
                'module' => Module::SETTINGS,
                'action' => 'VIEW_DEPARTMENTS',
                'message' => 'User viewed departments list',
                'user_id' => $userId ?? null,
                'custom1' => json_encode([
                    'total_records' => $data->count(),
                    'retrieved_at' => now()->toDateTimeString(),
                ]),
                'custom2' => 'IP: '.request()->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'message' => 'Departments retrieved successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => Auth::id() ?? null,
                'error_message' => 'Failed to fetch departments: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch departments',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get Roles
     *
     * Returns all active roles for dropdowns.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function getRoles()
    {
        try {
            $data = Role::where('status', true)
                ->select('id', 'name', 'description')
                ->orderBy('name')
                ->get();

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'VIEW_ROLES',
                'message' => 'User viewed roles list',
                'user_id' => $userId ?? null,
                'custom1' => json_encode([
                    'total_records' => $data->count(),
                    'retrieved_at' => now()->toDateTimeString(),
                ]),
                'custom2' => 'IP: '.request()->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'message' => 'Roles retrieved successfully',
            ], 200);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => Auth::id() ?? null,
                'error_message' => 'Failed to fetch roles: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch roles',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
