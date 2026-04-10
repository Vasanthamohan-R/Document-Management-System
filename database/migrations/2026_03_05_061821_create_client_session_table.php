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
            $table->foreignId('client_id')->constrained('client')->onDelete('cascade');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('token', 512); // update in 512 in db
            $table->timestamp('expires_in')->nullable();
            $table->tinyInteger('status')->default(1)->comment('1-active,2-expiry,3-banned');
            $table->timestamps();

            $table->index('client_id');
            $table->index('token');
            $table->index('status');
            $table->index('expires_in');
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
