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
        Schema::create('country', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('alpha_2', 2)->unique();
            $table->string('alpha_3', 3)->unique();
            $table->string('country_code', 3)->unique();
            $table->string('iso_3166_2');
            $table->string('region')->nullable();
            $table->string('sub_region')->nullable();
            $table->string('intermediate_region')->nullable();
            $table->string('region_code', 3)->nullable();
            $table->string('sub_region_code', 3)->nullable();
            $table->string('intermediate_region_code', 3)->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();

            // Indexes
            $table->index('alpha_2');
            $table->index('alpha_3');
            $table->index('country_code');
            $table->index('region');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country');
    }
};
