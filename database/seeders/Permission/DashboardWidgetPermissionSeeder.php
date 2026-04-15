<?php

namespace Database\Seeders\Permission;

use App\Models\Permission\Action;
use App\Models\Permission\Group;
use App\Models\Permission\Module;
use App\Models\Permission\Permission;
use App\Models\Permission\Role;
use App\Models\Permission\RolePermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardWidgetPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // 1. Ensure the Dashboard Module exists under a Management group
            // Let's attach it to 'Management' group (ID 1 usually, but let's fetch it)
            $managementGroup = Group::firstOrCreate(
                ['key' => 'management'],
                ['name' => 'Management', 'sort_order' => 1]
            );

            $dashboardModule = Module::firstOrCreate(
                ['key' => 'dashboard'],
                ['group_id' => $managementGroup->id, 'name' => 'Dashboard', 'sort_order' => 1]
            );

            // 2. Ensure Standard Actions Exist
            $standardActions = [
                ['name' => 'View', 'key' => 'view'],
                ['name' => 'Create', 'key' => 'create'],
                ['name' => 'Edit', 'key' => 'edit'],
                ['name' => 'Delete', 'key' => 'delete'],
                ['name' => 'Access', 'key' => 'access'],
            ];

            foreach ($standardActions as $action) {
                Action::firstOrCreate(['key' => $action['key']], ['name' => $action['name']]);
            }

            // 3. Create Custom Widget Actions
            $widgetActions = [
                ['name' => 'View Document Summary', 'key' => 'view_document_summary'],
                ['name' => 'View Department Flow', 'key' => 'view_department_flow'],
                ['name' => 'View Pending Documents', 'key' => 'view_pending_documents'],
            ];

            foreach ($widgetActions as $actionData) {
                $action = Action::firstOrCreate(['key' => $actionData['key']], ['name' => $actionData['name']]);
                
                // Tie Action to the Dashboard Module to create the specific Permission
                Permission::firstOrCreate(
                    [
                        'module_id' => $dashboardModule->id,
                        'action_id' => $action->id,
                    ],
                    [
                        'key_name' => $dashboardModule->key . '.' . $action->key,
                        'label' => 'Dashboard - ' . $actionData['name'],
                    ]
                );
            }

            // Tie Standard Actions to the Dashboard Module as well (view, pageAccess)
            $viewAction = Action::where('key', 'view')->first();
            Permission::firstOrCreate(
                ['module_id' => $dashboardModule->id, 'action_id' => $viewAction->id],
                ['key_name' => 'dashboard.view', 'label' => 'View Dashboard']
            );

            $accessAction = Action::where('key', 'access')->first();
            Permission::firstOrCreate(
                ['module_id' => $dashboardModule->id, 'action_id' => $accessAction->id],
                ['key_name' => 'dashboard.pageAccess', 'label' => 'Page Access - Dashboard']
            );

            // 4. Grant all Dashboard permissions to Super Admin role
            $superAdmin = Role::where('name', 'super_admin')->first();
            if ($superAdmin) {
                $dashboardPermissions = Permission::where('module_id', $dashboardModule->id)->get();
                foreach ($dashboardPermissions as $permission) {
                    RolePermission::updateOrCreate(
                        [
                            'role_id' => $superAdmin->id,
                            'permission_id' => $permission->id,
                        ],
                        [
                            'enabled' => true,
                        ]
                    );
                }
            }

            DB::commit();
            $this->command->info('Dashboard widget permissions seeded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to seed dashboard widget permissions: ' . $e->getMessage());
        }
    }
}
