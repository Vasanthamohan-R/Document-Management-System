<?php

namespace Database\Seeders\Auth;

use App\Models\Auth\Client;
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
                'expires_in' => now()->addDays(rand(1, 30)), // Expires in 1 to 30 days
                'status' => 1, // 1 = active
            ]);
        }
    }
}
