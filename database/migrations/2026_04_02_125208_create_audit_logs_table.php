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
            $table->foreignId('client_id')->nullable()->constrained('client')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('module')->nullable()->index();
            $table->string('action')->nullable()->index();
            $table->string('message')->nullable();
            $table->enum('status', ['1', '2', '3'])->nullable()->index()->comment('1 = Success, 2 = Failed, 3 = Pending');
            $table->string('ip_address')->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->text('custom1')->nullable();
            $table->text('custom2')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
