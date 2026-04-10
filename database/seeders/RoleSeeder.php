<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(
            ['name' => 'super_admin'],
            [
                'description' => 'Super Administrator with full access',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'description' => 'Administrator',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'staff'],
            [
                'description' => 'Staff Member',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'manager'],
            [
                'description' => 'Manager',
                'status' => true,
            ]
        );

        Role::firstOrCreate(
            ['name' => 'user'],
            [
                'description' => 'Regular User',
                'status' => true,
            ]
        );
    }
}
