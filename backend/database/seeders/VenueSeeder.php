<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Venue;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $venues = [
            [
                'name' => 'Grand Concert Hall',
                'address' => '123 Music Avenue, Downtown, New York, NY 10001, USA',
                'latitude' => 40.7589,
                'longitude' => -73.9851,
                'capacity' => 2000,
            ],
            [
                'name' => 'Tech Innovation Center',
                'address' => '456 Innovation Drive, Silicon Valley, San Francisco, CA 94105, USA',
                'latitude' => 37.7749,
                'longitude' => -122.4194,
                'capacity' => 500,
            ],
            [
                'name' => 'City Sports Arena',
                'address' => '789 Sports Boulevard, Los Angeles, CA 90210, USA',
                'latitude' => 34.0522,
                'longitude' => -118.2437,
                'capacity' => 15000,
            ],
            [
                'name' => 'Modern Art Gallery',
                'address' => '321 Art District, Cultural Quarter, Chicago, IL 60601, USA',
                'latitude' => 41.8781,
                'longitude' => -87.6298,
                'capacity' => 300,
            ],
            [
                'name' => 'Culinary Institute',
                'address' => '654 Food Street, Gourmet District, Miami, FL 33101, USA',
                'latitude' => 25.7617,
                'longitude' => -80.1918,
                'capacity' => 150,
            ],
            [
                'name' => 'Business Conference Center',
                'address' => '987 Business Park, Corporate District, Houston, TX 77001, USA',
                'latitude' => 29.7604,
                'longitude' => -95.3698,
                'capacity' => 800,
            ]
        ];

        foreach ($venues as $venue) {
            Venue::create($venue);
        }
    }
}
