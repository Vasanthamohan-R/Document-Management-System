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
            $table->foreignId('client_id')->nullable()->constrained('client')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->text('error_message');
            $table->string('error_code', 10)->nullable()->index();
            $table->string('file_path')->nullable();
            $table->string('class')->nullable();
            $table->string('function')->nullable();
            $table->integer('line')->nullable();

            $table->longText('stack_trace')->nullable();
            $table->json('context')->nullable();

            $table->string('ip_address', 45)->nullable()->index();
            $table->string('url', 500)->nullable();
            $table->string('method', 10)->nullable();
            $table->string('user_agent', 500)->nullable();

            $table->timestamps();

            $table->index('created_at');
            $table->index(['class', 'function']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('error_logs');
    }
};
