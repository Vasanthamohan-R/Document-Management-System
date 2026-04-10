<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Log\AuditLog;
use App\Models\Log\ErrorLog;
use App\Models\Permission\Module;
use App\Models\Permission\Permission;
use App\Models\Permission\Role;
use App\Models\Permission\RolePermission;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Class RoleController
 *
 * Handles role and permission management operations for the admin panel.
 * Includes listing roles, managing permissions, creating, updating,
 * and deleting roles with their associated permissions.
 *
 * @author DMS DEV TEAM
 *
 * @created 2026-03-05
 *
 * @version 1.1
 */
class RoleController extends Controller
{
    /**
     * Get Roles List with Filters
     *
     * Retrieves a paginated list of roles with support for various filters:
     * - Search by name or description
     * - Filter by status (Active/Inactive)
     * - Includes user count for each role
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;
            $query = Role::query()->where('status', '!=', Role::STATUS_DELETED);

            $appliedFilters = [];

            if ($request->filled('search')) {
                if ($request->searchBy === 'name') {
                    $query->where('name', 'like', "%{$request->search}%");
                    $appliedFilters['search'] = $request->search;
                    $appliedFilters['searchBy'] = 'name';
                } else {
                    $query->where('description', 'like', "%{$request->search}%");
                    $appliedFilters['search'] = $request->search;
                    $appliedFilters['searchBy'] = 'description';
                }
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status === 'Active' ? true : false);
                $appliedFilters['status'] = $request->status;
            }
            $roles = $query->withCount(['users' => function ($q) {
                $q->where('status', '!=', Role::STATUS_DELETED);
            }])->latest()->paginate(10);

            $transformedRoles = $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'status' => $role->status,
                    'users_count' => $role->users_count,
                    'created_at' => Carbon::parse($role->created_at)->format('d-m-Y h:i A'),
                    'updated_at' => Carbon::parse($role->updated_at)->format('d-m-Y h:i A'),
                ];
            });

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'VIEW_ROLES_LIST',
                'message' => 'User viewed roles list successfully',
                'user_id' => $userId,
                'custom1' => json_encode([
                    'filters_applied' => $appliedFilters,
                    'total_records' => $roles->total(),
                    'current_page' => $roles->currentPage(),
                    'per_page' => $roles->perPage(),
                    'last_page' => $roles->lastPage(),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Roles fetched successfully',
                'data' => [
                    'data' => $transformedRoles,
                    'current_page' => $roles->currentPage(),
                    'last_page' => $roles->lastPage(),
                    'per_page' => $roles->perPage(),
                    'total' => $roles->total(),
                ],
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Failed to fetch roles: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'filters' => $request->except(['_token']),
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

    /**
     * Get Permissions Schema
     *
     * Retrieves the complete permissions schema organized by modules and groups.
     * Returns modules with their associated permissions for role configuration.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function permissions(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;

            // Check if modules table exists and has data
            if (! Schema::hasTable('modules')) {
                return response()->json([
                    'status' => 'success',
                    'data' => [],
                    'message' => 'No modules configured yet',
                ]);
            }

            $modules = Module::with(['group', 'permissions.action'])
                ->orderBy('sort_order')
                ->get();

            if ($modules->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'data' => [],
                    'message' => 'No modules found',
                ]);
            }

            $data = $modules->map(function ($module) {
                $cardTitleMap = [
                    'users' => 'User Management',
                    'roles' => 'Role & Permissions',
                    'settings' => 'Settings',
                ];

                return [
                    'id' => $module->key,
                    'title' => $cardTitleMap[$module->key] ?? $module->name,
                    'group' => $module->group?->name ?? '',
                    'features' => $module->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->key_name,
                            'label' => $permission->label,
                            'enabled' => false,
                        ];
                    }),
                ];
            });

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'VIEW_PERMISSIONS_SCHEMA',
                'message' => 'User viewed permissions schema successfully',
                'user_id' => $userId,
                'custom1' => json_encode([
                    'modules_count' => $modules->count(),
                    'retrieved_at' => now()->toDateTimeString(),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Failed to fetch permissions schema: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch permissions schema',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Create New Role
     *
     * Validates request input, creates a new role,
     * and assigns permissions if provided.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function store(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;

            if (! $request->name) {

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role name is required',
                ], 422);
            }

            if (Role::where('name', $request->name)->exists()) {

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role name already exists',
                ], 409);
            }
            $role = Role::create([
                'name' => $request->name,
                'description' => $request->description,
                'status' => true,
            ]);

            if (! $role) {

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Failed to create role',
                ], 500);
            }

            if ($request->filled('permissions')) {
                foreach ($request->permissions as $group) {
                    foreach ($group['features'] as $feature) {
                        // Look up by key_name (e.g. "roles.create")
                        $permission = Permission::where('key_name', $feature['id'])->first();
                        if ($permission) {
                            RolePermission::updateOrCreate(
                                ['role_id' => $role->id, 'permission_id' => $permission->id],
                                ['enabled' => $feature['enabled'] ? true : false]
                            );
                        }
                    }
                }
            }
            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'CREATE_ROLE',
                'message' => 'New role created successfully',
                'user_id' => $userId,
                'old_value' => null,
                'new_value' => json_encode([
                    'role_id' => $role->id,
                    'role_name' => $role->name,
                    'role_description' => $role->description,
                ]),
                'custom1' => json_encode([
                    'permissions_assigned' => $request->filled('permissions') ? count($request->permissions) : 0,
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Role created successfully',
                'data' => $role,
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Unexpected error in role creation: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to create role',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get Role Details
     *
     * Retrieves a specific role by ID along with its associated permissions.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function show(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;

            if (! $request->id) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role ID is required',
                ], 422);
            }

            $role = Role::find($request->id);

            if (! $role) {

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role not found',
                ], 404);
            }
            $permissions = RolePermission::where('role_id', $role->id)
                ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
                ->select('permissions.key_name', 'role_permissions.enabled')
                ->get();

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'VIEW_ROLE_DETAILS',
                'message' => 'User viewed role details successfully',
                'user_id' => $userId,
                'custom1' => json_encode([
                    'role_id' => $role->id,
                    'role_name' => $role->name,
                    'permissions_count' => $permissions->count(),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            // Load permissions with key_name as flat array (for frontend compatibility)
            $permissions = RolePermission::where('role_id', $role->id)
                ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
                ->select('permissions.key_name', 'role_permissions.enabled')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => array_merge($role->toArray(), ['permissions' => $permissions]),
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Unexpected error in view role: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'role_id' => $request->id,
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to fetch role',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Update Role
     *
     * Updates an existing role's name and description,
     * and syncs permissions if provided.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function update(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;
            if (! $request->id) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role ID is required',
                ], 422);
            }

            $role = Role::find($request->id);

            if (! $role) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role not found',
                ], 404);
            }

            if (! $request->name) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role name is required',
                ], 422);
            }

            $exists = Role::where('name', $request->name)
                ->where('id', '!=', $request->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role name already exists',
                ], 409);
            }
            $oldData = [
                'name' => $role->name,
                'description' => $role->description,
            ];

            $role->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            if ($request->filled('permissions')) {
                $role->syncPermissions($request->permissions);
            }

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'UPDATE_ROLE',
                'message' => 'Role updated successfully',
                'user_id' => $userId,
                'old_value' => json_encode($oldData),
                'new_value' => json_encode([
                    'role_id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                ]),
                'custom1' => json_encode([
                    'permissions_updated' => $request->filled('permissions') ? true : false,
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Role updated successfully',
                'data' => $role,
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Unexpected error in role update: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'role_id' => $request->id,
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to update role',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Sync Role Permissions
     *
     * Synchronizes permissions for a specific role.
     * Replaces all existing permissions with the new set.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function syncPermissions(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;

            if (! $request->id) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role ID is required',
                ], 422);
            }

            $role = Role::find($request->id);

            if (! $role) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role not found',
                ], 404);
            }

            if (! $request->filled('permissions')) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Permissions are required',
                ], 422);
            }

            $role->syncPermissions($request->permissions);

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'SYNC_ROLE_PERMISSIONS',
                'message' => 'Role permissions synced successfully',
                'user_id' => $userId,
                'custom1' => json_encode([
                    'role_id' => $role->id,
                    'role_name' => $role->name,
                    'permissions_count' => count($request->permissions),
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Role permissions synced successfully',
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Unexpected error in sync permissions: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'role_id' => $request->id,
                    'permissions' => $request->permissions,
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to sync role permissions',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete Role
     *
     * Permanently deletes a role from the system.
     * Note: This will also remove all role-permission associations.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @since 1.0.0
     */
    public function destroy(Request $request)
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;

            if (! $request->id) {

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role ID is required',
                ], 422);
            }

            $role = Role::find($request->id);

            if (! $role) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Role not found',
                ], 404);
            }

            $userCount = $role->users()->where('status', '!=', Role::STATUS_DELETED)->count();
            Log::info($userCount);
            if ($userCount > 0) {

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Cannot delete role with associated users. Please reassign users first.',
                ], 409);
            }
            $deletedData = [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'role_description' => $role->description,
            ];

            $role->status = Role::STATUS_DELETED;
            $role->save();
            Log::info('After update - Status: '.$role->fresh()->status);

            AuditLog::log([
                'module' => Module::ROLE_MANAGEMENT,
                'action' => 'DELETE_ROLE',
                'message' => 'Role deleted successfully',
                'user_id' => $userId,
                'old_value' => json_encode($deletedData),
                'new_value' => null,
                'custom1' => json_encode([
                    'users_affected' => $userCount,
                ]),
                'custom2' => 'IP: '.$request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Role deleted successfully',
            ]);

        } catch (Exception $e) {
            ErrorLog::log([
                'user_id' => $request->user() ? $request->user()->id : null,
                'class' => __CLASS__,
                'function' => __FUNCTION__,
                'error_message' => 'Unexpected error in role deletion: '.$e->getMessage(),
                'error_code' => $e->getCode(),
                'file_path' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'context' => json_encode([
                    'role_id' => $request->id,
                    'error' => $e->getMessage(),
                ]),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Failed to delete role',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
