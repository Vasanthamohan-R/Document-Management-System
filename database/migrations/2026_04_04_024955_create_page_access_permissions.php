<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = Carbon::now();

        // Create "access" action if it doesn't exist
        $accessAction = DB::table('actions')->where('key', 'access')->first();
        if (! $accessAction) {
            DB::table('actions')->insert([
                'name' => 'Access',
                'key' => 'access',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $accessAction = DB::table('actions')->where('key', 'access')->first();
        }

        // Create pageAccess permissions for each module
        $modules = DB::table('modules')->get();

        foreach ($modules as $module) {
            DB::table('permissions')->updateOrInsert(
                [
                    'key_name' => $module->key.'.pageAccess',
                ],
                [
                    'module_id' => $module->id,
                    'action_id' => $accessAction->id,
                    'label' => 'Page Access - '.ucfirst($module->name),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove pageAccess permissions
        DB::table('permissions')->where('key_name', 'like', '%.pageAccess')->delete();
    }
};
