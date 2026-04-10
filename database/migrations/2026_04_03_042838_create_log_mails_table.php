<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_mails', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id')->nullable();

            $table->string('name');
            $table->string('recepient_mail');
            $table->string('system_mail');
            $table->text('message');
            $table->text('user_agent')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');  // Use set null, not cascade

            // Indexes for better query performance (RECOMMENDED)
            $table->index('recepient_mail');
            $table->index('status');
            $table->index('sent_at');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_mails');
    }
};
