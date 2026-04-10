<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('client_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('module')->nullable();

            $table->string('action')->nullable();
            $table->string('message')->nullable();
            $table->enum('status', ['1', '2', '3'])
                ->comment('1 = Success, 2 = Failed, 3 = Pending')
                ->nullable();

            $table->string('ip_address')->nullable();

            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();

            $table->text('custom1')->nullable();
            $table->text('custom2')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('client_id')
                ->references('id')
                ->on('clients')
                ->onDelete('set null');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // Indexes for performance
            $table->index(['client_id', 'user_id', 'created_at']);
            $table->index('action');
            $table->index('status');
            $table->index('module');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
