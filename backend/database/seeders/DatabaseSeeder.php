<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Test users - uncomment only when needed for development
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // Create additional users with different roles for testing
        // User::factory()->create([
        //     'name' => 'Event Organizer',
        //     'email' => 'organizer@example.com',
        //     'role' => 'organizer'
        // ]);

        // User::factory()->create([
        //     'name' => 'System Administrator',
        //     'email' => 'admin@example.com',
        //     'role' => 'admin'
        // ]);

        // Seed categories and venues - uncomment only when needed
        $this->call([
            CategorySeeder::class,
            VenueSeeder::class,
            EventSeeder::class,
        ]);
    }
}
