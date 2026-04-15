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
        Schema::create('client_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('client')->cascadeOnDelete();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('token', 512)->index();
            $table->timestamp('expires_in')->nullable()->index();
            $table->tinyInteger('status')->default(1)->index()->comment('1-active, 2-expiry, 3-banned');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_session');
    }
};
