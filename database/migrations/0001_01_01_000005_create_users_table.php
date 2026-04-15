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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->date('dob')->nullable();

            $table->enum('email_verified', ['1', '2', '3'])->default('1')->comment('1=unverified, 2=verified, 3=blocked');
            $table->timestamp('email_verified_at')->nullable();
            $table->enum('phone_verified', ['1', '2', '3'])->default('1')->comment('1=unverified, 2=verified, 3=blocked');
            $table->timestamp('phone_verified_at')->nullable();

            $table->string('password');
            $table->unsignedInteger('false_attempt')->default(0);

            $table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete()->comment('Foreign key to roles table');
            $table->foreignId('department_id')->constrained('department')->cascadeOnDelete()->comment('Foreign key to department table');

            $table->enum('status', ['1', '2', '3', '4'])->default('1')->comment('1=active, 2=inactive, 3=banned, 4=suspended');

            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('address_line_3')->nullable();
            $table->string('pincode', 20)->nullable();

            $table->foreignId('country_id')->nullable()->constrained('country')->nullOnDelete()->comment('Foreign key to country table');
            $table->foreignId('state_id')->nullable()->constrained('state')->nullOnDelete()->comment('Foreign key to state table');
            $table->foreignId('city_id')->nullable()->constrained('city')->nullOnDelete()->comment('Foreign key to city table');

            $table->timestamps();

            $table->index('email');
            $table->index('role_id');
            $table->index('department_id');
            $table->index('status');
            $table->index('country_id');
            $table->index('state_id');
            $table->index('city_id');
            $table->index('created_at');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index()->constrained('users')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
