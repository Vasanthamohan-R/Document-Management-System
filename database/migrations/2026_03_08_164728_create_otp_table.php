<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('otp');

        Schema::create('otp', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['email', 'phone']);
            $table->string('purpose'); // registration, password_reset
            $table->string('target');  // email or phone
            $table->string('otp', 6);
            $table->enum('status', ['unverified', 'verified', 'expired'])->default('unverified');
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->tinyInteger('attempts')->unsigned()->default(0);
            $table->tinyInteger('wrong_attempts')->unsigned()->default(0);
            $table->tinyInteger('max_attempts')->unsigned()->default(5);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'type', 'target', 'purpose', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp');
    }
};
