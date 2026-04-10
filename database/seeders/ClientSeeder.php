<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Optional: clear the table before seeding
        // Client::truncate();

        for ($i = 0; $i < 3; $i++) {
            Client::create([
                'name' => 'Client '.($i + 1),
                'client_id' => Client::generateClientId(),
                'client_secret' => Client::generateClientSecret(),
                'expires_in' => rand(3600, 86400), // 1 hour to 24 hours in seconds
                'status' => 'active',
            ]);
        }
    }
}
