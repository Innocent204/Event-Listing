<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Music',
                'color' => '#8B5CF6',
            ],
            [
                'name' => 'Technology',
                'color' => '#06B6D4',
            ],
            [
                'name' => 'Sports',
                'color' => '#10B981',
            ],
            [
                'name' => 'Arts & Culture',
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Food & Drink',
                'color' => '#EF4444',
            ],
            [
                'name' => 'Business',
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Education',
                'color' => '#6366F1',
            ],
            [
                'name' => 'Health & Wellness',
                'color' => '#EC4899',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
