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
            // Primary key
            $table->id();

            // Basic user information
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->date('dob')->nullable();

            // Email verification status
            $table->enum('email_verified', ['1', '2', '3'])
                ->default('1')
                ->comment('1=unverified, 2=verified, 3=blocked');
            $table->timestamp('email_verified_at')->nullable();

            // Phone verification status
            $table->enum('phone_verified', ['1', '2', '3'])
                ->default('1')
                ->comment('1=unverified, 2=verified, 3=blocked');
            $table->timestamp('phone_verified_at')->nullable();

            // Authentication
            $table->string('password');
            $table->unsignedInteger('false_attempt')->default(0);

            // Foreign keys - relationships
            $table->unsignedBigInteger('role_id')
                ->nullable()
                ->comment('Foreign key to roles table');

            $table->unsignedBigInteger('department_id')
                ->comment('Foreign key to departments table');

            // User status
            $table->enum('status', ['1', '2', '3', '4'])
                ->default('1')
                ->comment('1=active, 2=inactive, 3=banned, 4=suspended');

            // Address fields (original)
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('address_line_3')->nullable();
            $table->string('pincode', 20)->nullable();

            // Location foreign keys (normalized approach)
            $table->unsignedBigInteger('country_id')
                ->nullable()
                ->comment('Foreign key to countries table');

            $table->unsignedBigInteger('state_id')
                ->nullable()
                ->comment('Foreign key to states table');

            $table->unsignedBigInteger('city_id')
                ->nullable()
                ->comment('Foreign key to cities table');

            // Timestamps
            $table->timestamps();

            // Indexes for performance
            $table->index('email');
            $table->index('role_id');
            $table->index('department_id');
            $table->index('status');
            $table->index('country_id');
            $table->index('state_id');
            $table->index('city_id');
            $table->index('created_at');
        });

        // Password reset tokens table
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Sessions table
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
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

        Schema::dropIfExists('users');
    }
};
