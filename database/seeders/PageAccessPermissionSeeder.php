<?php

namespace Database\Seeders;

use App\Models\Action;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PageAccessPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Create "access" action if it doesn't exist
        $accessAction = Action::where('key', 'access')->first();
        if (! $accessAction) {
            $accessAction = Action::create([
                'name' => 'Access',
                'key' => 'access',
            ]);
            echo "✓ Created 'access' action\n";
        }

        // Create pageAccess permissions for each module
        $modules = Module::all();
        $created = 0;

        foreach ($modules as $module) {
            $keyName = $module->key.'.pageAccess';
            $permission = Permission::where('key_name', $keyName)->first();

            if (! $permission) {
                Permission::create([
                    'module_id' => $module->id,
                    'action_id' => $accessAction->id,
                    'key_name' => $keyName,
                    'label' => 'Page Access - '.ucfirst($module->name),
                ]);
                $created++;
            }
        }

        echo "✓ Created {$created} page access permissions\n";

        // Assign all pageAccess permissions to super_admin role(s)
        $superAdminRoles = Role::whereIn('name', ['super_admin', 'Super Admin'])->get();

        foreach ($superAdminRoles as $role) {
            $pageAccessPermissions = Permission::where('key_name', 'like', '%.pageAccess')->get();

            foreach ($pageAccessPermissions as $perm) {
                $role->permissions()->syncWithoutDetaching([
                    $perm->id => ['enabled' => true],
                ]);
            }

            echo "✓ Assigned page access permissions to role: {$role->name}\n";
        }
    }
}
