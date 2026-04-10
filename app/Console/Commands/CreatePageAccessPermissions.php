<?php

namespace App\Console\Commands;

use App\Models\Permission\Action;
use App\Models\Permission\Module;
use App\Models\Permission\Permission;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;

class CreatePageAccessPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-page-access-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create page access permissions for all modules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        try {
            // Create "access" action if it doesn't exist
            $accessAction = Action::where('key', 'access')->first();
            if (! $accessAction) {
                $this->info('Creating "access" action...');
                $accessAction = Action::create([
                    'name' => 'Access',
                    'key' => 'access',
                ]);
                $this->info('✓ Access action created');
            }

            // Create pageAccess permissions for each module
            $modules = Module::all();
            $created = 0;
            $updated = 0;

            foreach ($modules as $module) {
                $keyName = $module->key.'.pageAccess';
                $permission = Permission::where('key_name', $keyName)->first();

                if (! $permission) {
                    Permission::create([
                        'module_id' => $module->id,
                        'action_id' => $accessAction->id,
                        'key_name' => $keyName,
                        'label' => 'Page Access - '.ucfirst($module->name),
                    ]);
                    $this->info("✓ Created permission: {$keyName}");
                    $created++;
                } else {
                    $this->line("ℹ Permission already exists: {$keyName}");
                    $updated++;
                }
            }

            $this->info('');
            $this->info("Created: {$created} new permissions");
            $this->info("Already existed: {$updated} permissions");
            $this->info('✓ Page access permissions setup complete!');

        } catch (Exception $e) {
            $this->error('Failed to create page access permissions: '.$e->getMessage());

            return 1;
        }

        return 0;
    }
}
