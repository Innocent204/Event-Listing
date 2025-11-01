<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Category;
use App\Models\Venue;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all categories, venues, and users for relationships
        $categories = Category::all();
        $venues = Venue::all();
        $users = User::all();

        // If no users exist, create a test organizer
        if ($users->isEmpty()) {
            $organizer = User::factory()->create([
                'name' => 'Event Organizer',
                'email' => 'organizer@example.com',
                'role' => 'organizer'
            ]);
            $users = collect([$organizer]);
        }

        $events = [
            [
                'name' => 'Jazz Night at Grand Concert Hall',
                'description' => 'An evening of smooth jazz featuring local and international artists. Come enjoy great music in an intimate setting.',
                'start_date_time' => Carbon::now()->addDays(7)->setHour(19)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(7)->setHour(22)->setMinute(0),
                'venue_id' => $venues->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 45.00,
                'is_free' => false,
                'website' => 'https://grandconcerthall.com/jazz-night',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Music']
            ],
            [
                'name' => 'Tech Startup Pitch Competition',
                'description' => 'Watch innovative startups pitch their ideas to a panel of investors and industry experts. Network with entrepreneurs and investors.',
                'start_date_time' => Carbon::now()->addDays(14)->setHour(9)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(14)->setHour(17)->setMinute(0),
                'venue_id' => $venues->skip(1)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 25.00,
                'is_free' => false,
                'website' => 'https://techinnovationcenter.com/pitch-competition',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Technology', 'Business']
            ],
            [
                'name' => 'Basketball Championship Final',
                'description' => 'The ultimate showdown between the city\'s top basketball teams. Don\'t miss the thrilling conclusion to this year\'s championship!',
                'start_date_time' => Carbon::now()->addDays(21)->setHour(15)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(21)->setHour(18)->setMinute(0),
                'venue_id' => $venues->skip(2)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 75.00,
                'is_free' => false,
                'website' => 'https://citysportsarena.com/championship-final',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Sports']
            ],
            [
                'name' => 'Contemporary Art Exhibition Opening',
                'description' => 'Join us for the opening night of our latest contemporary art exhibition featuring works from emerging local artists.',
                'start_date_time' => Carbon::now()->addDays(10)->setHour(18)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(10)->setHour(21)->setMinute(0),
                'venue_id' => $venues->skip(3)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => null,
                'is_free' => true,
                'website' => 'https://modernartgallery.com/contemporary-exhibition',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Arts & Culture']
            ],
            [
                'name' => 'Wine Tasting & Food Pairing Workshop',
                'description' => 'Learn about wine tasting techniques and perfect food pairings from our expert sommeliers. Includes samples and light bites.',
                'start_date_time' => Carbon::now()->addDays(5)->setHour(16)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(5)->setHour(19)->setMinute(0),
                'venue_id' => $venues->skip(4)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 85.00,
                'is_free' => false,
                'website' => 'https://culinaryinstitute.edu/wine-workshop',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Food & Drink', 'Education']
            ],
            [
                'name' => 'Digital Marketing Conference 2024',
                'description' => 'A full-day conference featuring industry leaders discussing the latest trends in digital marketing, SEO, and social media strategies.',
                'start_date_time' => Carbon::now()->addDays(30)->setHour(8)->setMinute(30),
                'end_date_time' => Carbon::now()->addDays(30)->setHour(17)->setMinute(30),
                'venue_id' => $venues->skip(5)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 150.00,
                'is_free' => false,
                'website' => 'https://businessconferencecenter.com/digital-marketing-2024',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Business', 'Technology']
            ],
            [
                'name' => 'Free Community Yoga Class',
                'description' => 'Start your weekend with a free outdoor yoga session suitable for all levels. Bring your own mat and water bottle.',
                'start_date_time' => Carbon::now()->addDays(3)->setHour(9)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(3)->setHour(10)->setMinute(30),
                'venue_id' => $venues->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => null,
                'is_free' => true,
                'website' => 'https://grandconcerthall.com/community-yoga',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Health & Wellness']
            ],
            [
                'name' => 'Photography Workshop: Street Photography',
                'description' => 'Learn the art of street photography from professional photographers. Covers composition, lighting, and ethical considerations.',
                'start_date_time' => Carbon::now()->addDays(12)->setHour(10)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(12)->setHour(15)->setMinute(0),
                'venue_id' => $venues->skip(3)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 65.00,
                'is_free' => false,
                'website' => 'https://modernartgallery.com/photography-workshop',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Arts & Culture', 'Education']
            ],
            [
                'name' => 'Local Food Truck Festival',
                'description' => 'Sample delicious food from the city\'s best food trucks. Live music and family-friendly activities included.',
                'start_date_time' => Carbon::now()->addDays(18)->setHour(11)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(18)->setHour(20)->setMinute(0),
                'venue_id' => $venues->skip(2)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 15.00,
                'is_free' => false,
                'website' => 'https://citysportsarena.com/food-truck-festival',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Food & Drink']
            ],
            [
                'name' => 'AI & Machine Learning Workshop',
                'description' => 'Hands-on workshop covering practical applications of AI and machine learning. No prior experience required.',
                'start_date_time' => Carbon::now()->addDays(25)->setHour(13)->setMinute(0),
                'end_date_time' => Carbon::now()->addDays(25)->setHour(17)->setMinute(0),
                'venue_id' => $venues->skip(1)->first()->id,
                'organizer_id' => $users->first()->id,
                'ticket_price' => 95.00,
                'is_free' => false,
                'website' => 'https://techinnovationcenter.com/ai-workshop',
                'status' => 'approved',
                'approved_at' => Carbon::now(),
                'categories' => ['Technology', 'Education']
            ]
        ];

        foreach ($events as $eventData) {
            $categoriesForEvent = collect($eventData['categories'])->map(function ($categoryName) use ($categories) {
                return $categories->where('name', $categoryName)->first();
            })->filter()->pluck('id')->toArray();

            $event = Event::create([
                'name' => $eventData['name'],
                'description' => $eventData['description'],
                'start_date_time' => $eventData['start_date_time'],
                'end_date_time' => $eventData['end_date_time'],
                'venue_id' => $eventData['venue_id'],
                'organizer_id' => $eventData['organizer_id'],
                'ticket_price' => $eventData['ticket_price'],
                'is_free' => $eventData['is_free'],
                'website' => $eventData['website'],
                'status' => $eventData['status'],
                'approved_at' => $eventData['approved_at'],
            ]);

            if (!empty($categoriesForEvent)) {
                $event->categories()->attach($categoriesForEvent);
            }
        }
    }
}
