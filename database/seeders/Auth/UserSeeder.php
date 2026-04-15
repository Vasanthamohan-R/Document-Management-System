<?php

namespace Database\Seeders\Auth;

use App\Models\Auth\Department;
use App\Models\Auth\User;
use App\Models\Permission\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the Super Admin role
        $superAdminRole = Role::where('name', 'Super Admin')->first();

        if (!$superAdminRole) {
            $this->command->error('Super Admin role not found. Please run RoleSeeder first.');
            return;
        }

        // Find a default department (Finance)
        $department = Department::where('name', 'Finance')->first();

        if (!$department) {
            $this->command->error('Finance department not found. Please run DepartmentSeeder first.');
            return;
        }

        // Create the user
        User::updateOrCreate(
            ['email' => 'denahu08@gmail.com'],
            [
                'name' => 'Dena Hu',
                'password' => Hash::make('Demo@123'),
                'role_id' => $superAdminRole->id,
                'department_id' => $department->id,
                'status' => User::STATUS_ACTIVE,
            ]
        );

        $this->command->info('✓ User Dena Hu created and assigned Super Admin role.');
    }
}
