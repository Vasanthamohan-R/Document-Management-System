<?php

namespace Database\Seeders\Auth;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Finance',
                'description' => 'Finance department for financial approvals and budget management',
                'status' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'State Checker',
                'description' => 'State Checker department for document verification',
                'status' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'State Approver',
                'description' => 'State Approver department for state-level approvals',
                'status' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Approver',
                'description' => 'Approver department for final document approvals',
                'status' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('department')->insert($departments);
    }
}
