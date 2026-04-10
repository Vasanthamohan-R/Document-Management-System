<?php

namespace App\Models\Permission;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    public const STATUS_ACTIVE = 1;

    public const STATUS_INACTIVE = 2;

    public const STATUS_DELETED = 3;

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    /**
     * Relationship to Users
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Relationship to Permissions via RolePermission
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id')
            ->withPivot('enabled')
            ->withTimestamps();
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermission(string $permissionKey): bool
    {
        return $this->permissions()->where('key_name', $permissionKey)->wherePivot('enabled', true)->exists();
    }

    /**
     * Get enabled permissions
     */
    public function getEnabledPermissionsAttribute()
    {
        return $this->permissions()->wherePivot('enabled', true)->get();
    }

    /**
     * Sync role permissions by permission key names.
     * Handles both flat array and grouped structure from frontend
     */
    public function syncPermissions(array $permissions): void
    {
        $syncData = [];

        // Handle grouped structure (from frontend with pageAccess)
        if (isset($permissions[0]['features'])) {
            foreach ($permissions as $group) {
                if (! isset($group['features'])) {
                    continue;
                }

                // Handle pageAccess permission
                if (isset($group['id']) && isset($group['pageAccess'])) {
                    $pageAccessKey = $group['id'].'.pageAccess';
                    $pageAccessPermission = Permission::where('key_name', $pageAccessKey)->first();
                    if ($pageAccessPermission) {
                        $syncData[$pageAccessPermission->id] = [
                            'enabled' => ! empty($group['pageAccess']),
                        ];
                    }
                }

                // Handle feature permissions
                foreach ($group['features'] as $feature) {
                    if (! isset($feature['id'])) {
                        continue;
                    }

                    $permissionModel = Permission::where('key_name', $feature['id'])->first();
                    if (! $permissionModel) {
                        continue;
                    }

                    $syncData[$permissionModel->id] = [
                        'enabled' => ! empty($feature['enabled']),
                    ];
                }
            }
        }
        // Handle flat array structure
        else {
            foreach ($permissions as $permission) {
                if (! isset($permission['id'])) {
                    continue;
                }

                $permissionModel = Permission::where('key_name', $permission['id'])->first();
                if (! $permissionModel) {
                    continue;
                }

                $syncData[$permissionModel->id] = [
                    'enabled' => ! empty($permission['enabled']),
                ];
            }
        }

        $this->permissions()->sync($syncData);
    }
}
