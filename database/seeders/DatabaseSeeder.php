<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Location Seeders
        $this->call([
            Location\CountrySeeder::class,
            Location\StateSeeder::class,
            Location\CitySeeder::class,
        ]);

        // Auth & Organizational Seeders
        $this->call([
            Auth\ClientSeeder::class,
            Auth\DepartmentSeeder::class,
        ]);

        // Permission & Role Seeders
        $this->call([
            Permission\ModulePermissionSeeder::class,
            Permission\DashboardWidgetPermissionSeeder::class,
            Permission\RoleSeeder::class,
            Permission\SuperAdminPermissionSeeder::class,
        ]);

        // User Seeders
        $this->call([
            Auth\UserSeeder::class,
        ]);
    }
}
