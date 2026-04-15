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
            $table->string('name');
            $table->string('key')->unique();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ✅ MODULES
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->string('name');
            $table->string('key')->unique();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ✅ ACTIONS
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->timestamps();
        });

        // ✅ PERMISSIONS
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('action_id')->constrained('actions')->cascadeOnDelete();
            $table->string('key_name')->unique();
            $table->string('label');
            $table->timestamps();
            $table->unique(['module_id', 'action_id']);
        });

        // ✅ ROLE PERMISSIONS (Junction Table)
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->boolean('enabled')->default(false);
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
