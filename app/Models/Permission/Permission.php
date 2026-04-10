<?php

namespace App\Models\Permission;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $table = 'permissions';

    protected $fillable = ['module_id', 'action_id', 'key_name', 'label'];

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function action()
    {
        return $this->belongsTo(Action::class, 'action_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions', 'permission_id', 'role_id')
            ->withPivot('enabled')
            ->withTimestamps();
    }

    public function scopeForModule($query, string $moduleKey)
    {
        return $query->whereHas('module', function ($q) use ($moduleKey) {
            $q->where('key', $moduleKey);
        });
    }

    public function scopeForAction($query, string $actionKey)
    {
        return $query->whereHas('action', function ($q) use ($actionKey) {
            $q->where('key', $actionKey);
        });
    }
}
