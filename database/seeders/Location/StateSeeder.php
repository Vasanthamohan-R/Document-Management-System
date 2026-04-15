<?php

namespace Database\Seeders\Location;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $states = [
            ['id' => 1, 'country_id' => 135, 'name' => 'Johor', 'name_ssm' => 'JOHOR', 'code' => 'JHR', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 2, 'country_id' => 135, 'name' => 'Kedah', 'name_ssm' => 'KEDAH', 'code' => 'KDH', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 3, 'country_id' => 135, 'name' => 'Kelantan', 'name_ssm' => 'KELANTAN', 'code' => 'KTN', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 4, 'country_id' => 135, 'name' => 'Melaka', 'name_ssm' => 'MELAKA', 'code' => 'MLK', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 5, 'country_id' => 135, 'name' => 'Negeri Sembilan', 'name_ssm' => 'NEGERI SEMBILAN', 'code' => 'NSN', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 6, 'country_id' => 135, 'name' => 'Pahang', 'name_ssm' => 'PAHANG', 'code' => 'PHG', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 7, 'country_id' => 135, 'name' => 'Penang', 'name_ssm' => 'PULAU PINANG', 'code' => 'PNG', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 8, 'country_id' => 135, 'name' => 'Perak', 'name_ssm' => 'PERAK', 'code' => 'PRK', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 9, 'country_id' => 135, 'name' => 'Perlis', 'name_ssm' => 'PERLIS', 'code' => 'PLS', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 10, 'country_id' => 135, 'name' => 'Sabah', 'name_ssm' => 'SABAH', 'code' => 'SBH', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 11, 'country_id' => 135, 'name' => 'Sarawak', 'name_ssm' => 'SARAWAK', 'code' => 'SWK', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 12, 'country_id' => 135, 'name' => 'Selangor', 'name_ssm' => 'SELANGOR', 'code' => 'SGR', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 13, 'country_id' => 135, 'name' => 'Terengganu', 'name_ssm' => 'TERENGGANU', 'code' => 'TRG', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 14, 'country_id' => 135, 'name' => 'Kuala Lumpur', 'name_ssm' => 'WILAYAH PERSEKUTUAN', 'code' => 'KUL', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 15, 'country_id' => 135, 'name' => 'Labuan', 'name_ssm' => 'W.P. LABUAN', 'code' => 'LBN', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
            ['id' => 16, 'country_id' => 135, 'name' => 'Putrajaya', 'name_ssm' => 'W.P. PUTRAJAYA', 'code' => 'PJY', 'is_active' => 1, 'created_at' => '2025-11-04 01:05:16', 'updated_at' => '2025-11-04 01:05:16'],
        ];

        DB::table('state')->insert($states);
    }
}
