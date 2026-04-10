<?php

namespace Database\Seeders;

use App\Models\Action;
use App\Models\Group;
use App\Models\Module;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class ModulePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ✅ Create Groups
        $managementGroup = Group::firstOrCreate(
            ['key' => 'management'],
            ['name' => 'Management', 'sort_order' => 1]
        );

        $documentGroup = Group::firstOrCreate(
            ['key' => 'documents'],
            ['name' => 'Documents', 'sort_order' => 2]
        );

        $logsGroup = Group::firstOrCreate(
            ['key' => 'logs'],
            ['name' => 'Logs', 'sort_order' => 3]
        );

        // ✅ Create Actions
        $viewAction = Action::firstOrCreate(['key' => 'view'], ['name' => 'View']);
        $createAction = Action::firstOrCreate(['key' => 'create'], ['name' => 'Create']);
        $editAction = Action::firstOrCreate(['key' => 'edit'], ['name' => 'Edit']);
        $deleteAction = Action::firstOrCreate(['key' => 'delete'], ['name' => 'Delete']);
        $accessAction = Action::firstOrCreate(['key' => 'access'], ['name' => 'Access']);

        // ✅ Create Modules and Permissions
        // Users Module
        $usersModule = Module::firstOrCreate(
            ['key' => 'users'],
            [
                'group_id' => $managementGroup->id,
                'name' => 'User Management',
                'sort_order' => 1,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'users.view'],
            [
                'module_id' => $usersModule->id,
                'action_id' => $viewAction->id,
                'label' => 'View Users',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'users.create'],
            [
                'module_id' => $usersModule->id,
                'action_id' => $createAction->id,
                'label' => 'Create User',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'users.edit'],
            [
                'module_id' => $usersModule->id,
                'action_id' => $editAction->id,
                'label' => 'Edit User',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'users.delete'],
            [
                'module_id' => $usersModule->id,
                'action_id' => $deleteAction->id,
                'label' => 'Delete User',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'users.pageAccess'],
            [
                'module_id' => $usersModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - User Management',
            ]
        );

        // Roles Module
        $rolesModule = Module::firstOrCreate(
            ['key' => 'roles'],
            [
                'group_id' => $managementGroup->id,
                'name' => 'Role & Permissions',
                'sort_order' => 2,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'roles.view'],
            [
                'module_id' => $rolesModule->id,
                'action_id' => $viewAction->id,
                'label' => 'View Roles',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'roles.create'],
            [
                'module_id' => $rolesModule->id,
                'action_id' => $createAction->id,
                'label' => 'Create Role',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'roles.edit'],
            [
                'module_id' => $rolesModule->id,
                'action_id' => $editAction->id,
                'label' => 'Edit Role',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'roles.delete'],
            [
                'module_id' => $rolesModule->id,
                'action_id' => $deleteAction->id,
                'label' => 'Delete Role',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'roles.pageAccess'],
            [
                'module_id' => $rolesModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - Role & Permissions',
            ]
        );

        // Documents Module
        $documentsModule = Module::firstOrCreate(
            ['key' => 'all_documents'],
            [
                'group_id' => $documentGroup->id,
                'name' => 'All Documents',
                'sort_order' => 1,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'all_documents.view'],
            [
                'module_id' => $documentsModule->id,
                'action_id' => $viewAction->id,
                'label' => 'View Documents',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'all_documents.pageAccess'],
            [
                'module_id' => $documentsModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - All Documents',
            ]
        );

        // Upload Module
        $uploadModule = Module::firstOrCreate(
            ['key' => 'upload'],
            [
                'group_id' => $documentGroup->id,
                'name' => 'Upload Document',
                'sort_order' => 2,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'upload.create'],
            [
                'module_id' => $uploadModule->id,
                'action_id' => $createAction->id,
                'label' => 'Upload Document',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'upload.pageAccess'],
            [
                'module_id' => $uploadModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - Upload',
            ]
        );

        // Cloud Storage Module
        $cloudModule = Module::firstOrCreate(
            ['key' => 'cloud'],
            [
                'group_id' => $documentGroup->id,
                'name' => 'Cloud Storage',
                'sort_order' => 3,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'cloud.view'],
            [
                'module_id' => $cloudModule->id,
                'action_id' => $viewAction->id,
                'label' => 'View Cloud Storage',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'cloud.pageAccess'],
            [
                'module_id' => $cloudModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - Cloud Storage',
            ]
        );

        // Audit Logs Module
        $auditModule = Module::firstOrCreate(
            ['key' => 'audit'],
            [
                'group_id' => $logsGroup->id,
                'name' => 'Audit Logs',
                'sort_order' => 1,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'audit.view'],
            [
                'module_id' => $auditModule->id,
                'action_id' => $viewAction->id,
                'label' => 'View Audit Logs',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'audit.pageAccess'],
            [
                'module_id' => $auditModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - Audit Logs',
            ]
        );

        // Contact Logs Module
        $contactModule = Module::firstOrCreate(
            ['key' => 'contact'],
            [
                'group_id' => $logsGroup->id,
                'name' => 'Contact Logs',
                'sort_order' => 2,
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'contact.view'],
            [
                'module_id' => $contactModule->id,
                'action_id' => $viewAction->id,
                'label' => 'View Contact Logs',
            ]
        );

        Permission::firstOrCreate(
            ['key_name' => 'contact.pageAccess'],
            [
                'module_id' => $contactModule->id,
                'action_id' => $accessAction->id,
                'label' => 'Page Access - Contact Logs',
            ]
        );

        echo "✓ Modules, Actions, and Permissions seeded successfully!\n";
    }
}
