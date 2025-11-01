<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->dateTime('start_date_time');
            $table->dateTime('end_date_time');
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->decimal('ticket_price', 10, 2)->nullable();
            $table->boolean('is_free')->default(true);
            $table->string('website')->nullable();
            $table->string('ticketing_link')->nullable();
            $table->string('image_url')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'cancelled', 'rejected'])->default('draft');
            $table->text('admin_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
