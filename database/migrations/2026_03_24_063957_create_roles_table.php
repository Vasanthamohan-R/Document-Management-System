<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ ROLES
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->boolean('status')->default(true); // true = active
            $table->timestamps();
        });

        // ✅ GROUPS
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // Management
            $table->string('key')->unique(); // management
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ✅ MODULES
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->string('name');          // User Management
            $table->string('key')->unique(); // user
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ✅ ACTIONS
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // View, Create
            $table->string('key')->unique(); // view, create
            $table->timestamps();
        });

        // ✅ PERMISSIONS
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('action_id')->constrained()->cascadeOnDelete();
            $table->string('key_name')->unique(); // user.view
            $table->string('label');              // View User
            $table->timestamps();
            $table->unique(['module_id', 'action_id']); // avoid duplicate
        });

        // ✅ ROLE PERMISSIONS (Junction Table)
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(false); // 🔥 TRUE/FALSE
            $table->timestamps();
            $table->unique(['role_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('actions');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('roles');
    }
};
