<?php

namespace Database\Seeders\Permission;

use App\Models\Permission\Permission;
use App\Models\Permission\Role;
use Illuminate\Database\Seeder;

class SuperAdminPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find super_admin role (handles both 'super_admin' and 'Super Admin')
        $superAdminRoles = Role::whereIn('name', ['super_admin', 'Super Admin'])->get();

        if ($superAdminRoles->isEmpty()) {
            echo "Super admin role not found. Creating it...\n";
            $role = Role::create([
                'name' => 'super_admin',
                'description' => 'Super Administrator with full access',
                'status' => true,
            ]);
            $superAdminRoles = collect([$role]);
        }

        // Get all permissions (including pageAccess permissions)
        $allPermissions = Permission::all();

        // Assign all permissions to each super_admin role with enabled = true
        foreach ($superAdminRoles as $role) {
            $syncData = [];

            foreach ($allPermissions as $permission) {
                // Enable all permissions for super admin, including pageAccess
                $syncData[$permission->id] = ['enabled' => true];
            }

            $role->permissions()->sync($syncData);

            echo '✓ Assigned '.count($allPermissions)." permissions to role: {$role->name}\n";
        }
    }
}
