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
        Schema::create('state', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->nullable()->constrained('country')->nullOnDelete();
            $table->string('name');
            $table->string('name_ssm')->nullable();
            $table->string('code', 10)->nullable();
            $table->boolean('is_active')->default(1);
            $table->timestamps();

            // Indexes
            $table->index('country_id');
            $table->index('name');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('state');
    }
};
