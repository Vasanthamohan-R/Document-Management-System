<?php

namespace App\Services;

use App\Models\Permission\Action;
use App\Models\Permission\Module;
use App\Models\Permission\Permission;
use Exception;
use Illuminate\Console\Command;

class CreatePageAccessPermissions extends Command
{
    protected $signature = 'app:create-page-access-permissions';

    protected $description = 'Create page access permissions for all modules';

    /**
     * Core logic (REUSABLE)
     */
    public function executeLogic()
    {
        try {
            $accessAction = Action::where('key', 'access')->first();

            if (! $accessAction) {
                $accessAction = Action::create([
                    'name' => 'Access',
                    'key' => 'access',
                ]);
            }

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
                    $created++;
                } else {
                    $updated++;
                }
            }

            return [
                'status' => true,
                'created' => $created,
                'existing' => $updated,
                'message' => 'Done',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * CLI Execution
     */
    public function handle()
    {
        $result = $this->executeLogic();

        if (! $result['status']) {
            $this->error($result['message']);

            return 1;
        }

        $this->info("Created: {$result['created']}");
        $this->info("Existing: {$result['existing']}");
        $this->info('✓ Completed');

        return 0;
    }
}
