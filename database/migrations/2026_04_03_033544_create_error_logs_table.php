<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('client_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();

            // Error details
            $table->text('error_message');
            $table->string('error_code', 10)->nullable();
            $table->string('file_path')->nullable();
            $table->string('class')->nullable();
            $table->string('function')->nullable();
            $table->integer('line')->nullable();

            // Stack trace and context
            $table->longText('stack_trace')->nullable();
            $table->json('context')->nullable();

            // Request information
            $table->string('ip_address', 45)->nullable();
            $table->string('url', 500)->nullable();
            $table->string('method', 10)->nullable();
            $table->string('user_agent', 500)->nullable();

            $table->timestamps();

            // ========== FOREIGN KEY CONSTRAINTS ==========
            $table->foreign('client_id')
                ->references('id')
                ->on('client')
                ->onDelete('set null');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // ========== INDEXES FOR PERFORMANCE ==========
            $table->index('client_id');
            $table->index('user_id');
            $table->index('error_code');
            $table->index('created_at');
            $table->index(['class', 'function']);
            $table->index('ip_address');
        });
    }

    public function down()
    {
        Schema::dropIfExists('error_logs');
    }
};
