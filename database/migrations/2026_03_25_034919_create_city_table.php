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
        Schema::create('city', function (Blueprint $table) {
            $table->id();
            // Foreign keys matching your SQL constraints
            $table->foreignId('state_id')->nullable()->constrained('state')->nullOnDelete();
            $table->foreignId('country_id')->nullable()->constrained('country')->nullOnDelete();

            $table->string('name')->index();
            $table->string('code', 10)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('city');
    }
};
