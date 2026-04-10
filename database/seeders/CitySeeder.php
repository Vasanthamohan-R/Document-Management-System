<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Malaysian Cities by State
        $cities = [
            // Johor (state_id = 1)
            ['state_id' => 1, 'country_id' => 135, 'name' => 'Johor Bahru', 'code' => 'JHB', 'is_active' => 1],
            ['state_id' => 1, 'country_id' => 135, 'name' => 'Batu Pahat', 'code' => 'BPH', 'is_active' => 1],
            ['state_id' => 1, 'country_id' => 135, 'name' => 'Muar', 'code' => 'MUA', 'is_active' => 1],
            ['state_id' => 1, 'country_id' => 135, 'name' => 'Kluang', 'code' => 'KLG', 'is_active' => 1],
            ['state_id' => 1, 'country_id' => 135, 'name' => 'Segamat', 'code' => 'SGM', 'is_active' => 1],
            ['state_id' => 1, 'country_id' => 135, 'name' => 'Kulai', 'code' => 'KLI', 'is_active' => 1],

            // Kedah (state_id = 2)
            ['state_id' => 2, 'country_id' => 135, 'name' => 'Alor Setar', 'code' => 'AOR', 'is_active' => 1],
            ['state_id' => 2, 'country_id' => 135, 'name' => 'Sungai Petani', 'code' => 'SPT', 'is_active' => 1],
            ['state_id' => 2, 'country_id' => 135, 'name' => 'Kulim', 'code' => 'KLM', 'is_active' => 1],
            ['state_id' => 2, 'country_id' => 135, 'name' => 'Langkawi', 'code' => 'LKW', 'is_active' => 1],

            // Kelantan (state_id = 3)
            ['state_id' => 3, 'country_id' => 135, 'name' => 'Kota Bharu', 'code' => 'KBR', 'is_active' => 1],
            ['state_id' => 3, 'country_id' => 135, 'name' => 'Pasir Mas', 'code' => 'PSM', 'is_active' => 1],
            ['state_id' => 3, 'country_id' => 135, 'name' => 'Tanah Merah', 'code' => 'TMH', 'is_active' => 1],

            // Melaka (state_id = 4)
            ['state_id' => 4, 'country_id' => 135, 'name' => 'Melaka City', 'code' => 'MLK', 'is_active' => 1],
            ['state_id' => 4, 'country_id' => 135, 'name' => 'Ayer Keroh', 'code' => 'AKH', 'is_active' => 1],
            ['state_id' => 4, 'country_id' => 135, 'name' => 'Masjid Tanah', 'code' => 'MST', 'is_active' => 1],

            // Negeri Sembilan (state_id = 5)
            ['state_id' => 5, 'country_id' => 135, 'name' => 'Seremban', 'code' => 'SRB', 'is_active' => 1],
            ['state_id' => 5, 'country_id' => 135, 'name' => 'Nilai', 'code' => 'NIL', 'is_active' => 1],
            ['state_id' => 5, 'country_id' => 135, 'name' => 'Port Dickson', 'code' => 'PDK', 'is_active' => 1],

            // Pahang (state_id = 6)
            ['state_id' => 6, 'country_id' => 135, 'name' => 'Kuantan', 'code' => 'KUA', 'is_active' => 1],
            ['state_id' => 6, 'country_id' => 135, 'name' => 'Temerloh', 'code' => 'TML', 'is_active' => 1],
            ['state_id' => 6, 'country_id' => 135, 'name' => 'Cameron Highlands', 'code' => 'CHG', 'is_active' => 1],
            ['state_id' => 6, 'country_id' => 135, 'name' => 'Bentong', 'code' => 'BTG', 'is_active' => 1],

            // Penang (state_id = 7)
            ['state_id' => 7, 'country_id' => 135, 'name' => 'George Town', 'code' => 'GTN', 'is_active' => 1],
            ['state_id' => 7, 'country_id' => 135, 'name' => 'Butterworth', 'code' => 'BTW', 'is_active' => 1],
            ['state_id' => 7, 'country_id' => 135, 'name' => 'Bukit Mertajam', 'code' => 'BKM', 'is_active' => 1],
            ['state_id' => 7, 'country_id' => 135, 'name' => 'Bayan Lepas', 'code' => 'BLP', 'is_active' => 1],

            // Perak (state_id = 8)
            ['state_id' => 8, 'country_id' => 135, 'name' => 'Ipoh', 'code' => 'IPH', 'is_active' => 1],
            ['state_id' => 8, 'country_id' => 135, 'name' => 'Taiping', 'code' => 'TPG', 'is_active' => 1],
            ['state_id' => 8, 'country_id' => 135, 'name' => 'Teluk Intan', 'code' => 'TLI', 'is_active' => 1],
            ['state_id' => 8, 'country_id' => 135, 'name' => 'Lumut', 'code' => 'LMT', 'is_active' => 1],

            // Perlis (state_id = 9)
            ['state_id' => 9, 'country_id' => 135, 'name' => 'Kangar', 'code' => 'KGR', 'is_active' => 1],
            ['state_id' => 9, 'country_id' => 135, 'name' => 'Padang Besar', 'code' => 'PDB', 'is_active' => 1],

            // Sabah (state_id = 10)
            ['state_id' => 10, 'country_id' => 135, 'name' => 'Kota Kinabalu', 'code' => 'KKB', 'is_active' => 1],
            ['state_id' => 10, 'country_id' => 135, 'name' => 'Sandakan', 'code' => 'SDK', 'is_active' => 1],
            ['state_id' => 10, 'country_id' => 135, 'name' => 'Tawau', 'code' => 'TAW', 'is_active' => 1],
            ['state_id' => 10, 'country_id' => 135, 'name' => 'Lahad Datu', 'code' => 'LHD', 'is_active' => 1],

            // Sarawak (state_id = 11)
            ['state_id' => 11, 'country_id' => 135, 'name' => 'Kuching', 'code' => 'KCH', 'is_active' => 1],
            ['state_id' => 11, 'country_id' => 135, 'name' => 'Miri', 'code' => 'MIR', 'is_active' => 1],
            ['state_id' => 11, 'country_id' => 135, 'name' => 'Sibu', 'code' => 'SBU', 'is_active' => 1],
            ['state_id' => 11, 'country_id' => 135, 'name' => 'Bintulu', 'code' => 'BTU', 'is_active' => 1],

            // Selangor (state_id = 12)
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Shah Alam', 'code' => 'SAL', 'is_active' => 1],
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Petaling Jaya', 'code' => 'PJY', 'is_active' => 1],
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Subang Jaya', 'code' => 'SBJ', 'is_active' => 1],
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Klang', 'code' => 'KLG', 'is_active' => 1],
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Kajang', 'code' => 'KJG', 'is_active' => 1],
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Ampang', 'code' => 'AMP', 'is_active' => 1],
            ['state_id' => 12, 'country_id' => 135, 'name' => 'Cheras', 'code' => 'CHR', 'is_active' => 1],

            // Terengganu (state_id = 13)
            ['state_id' => 13, 'country_id' => 135, 'name' => 'Kuala Terengganu', 'code' => 'KTR', 'is_active' => 1],
            ['state_id' => 13, 'country_id' => 135, 'name' => 'Kemaman', 'code' => 'KMN', 'is_active' => 1],
            ['state_id' => 13, 'country_id' => 135, 'name' => 'Dungun', 'code' => 'DGN', 'is_active' => 1],

            // Kuala Lumpur (state_id = 14)
            ['state_id' => 14, 'country_id' => 135, 'name' => 'Kuala Lumpur', 'code' => 'KUL', 'is_active' => 1],
            ['state_id' => 14, 'country_id' => 135, 'name' => 'Bukit Bintang', 'code' => 'BBT', 'is_active' => 1],
            ['state_id' => 14, 'country_id' => 135, 'name' => 'Bangsar', 'code' => 'BNG', 'is_active' => 1],

            // Labuan (state_id = 15)
            ['state_id' => 15, 'country_id' => 135, 'name' => 'Labuan', 'code' => 'LBN', 'is_active' => 1],

            // Putrajaya (state_id = 16)
            ['state_id' => 16, 'country_id' => 135, 'name' => 'Putrajaya', 'code' => 'PTJ', 'is_active' => 1],
        ];

        DB::table('city')->insert($cities);
    }
}
