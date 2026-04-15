<?php

namespace Database\Seeders\Permission;

use App\Models\Permission\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(
            ['name' => 'Super Admin'],
            [
                'description' => 'Super Administrator with full access',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'Admin'],
            [
                'description' => 'Administrator',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'Staff'],
            [
                'description' => 'Staff Member',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'Manager'],
            [
                'description' => 'Manager',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'User'],
            [
                'description' => 'Regular User',
                'status' => true,
            ]
        );
    }
}
