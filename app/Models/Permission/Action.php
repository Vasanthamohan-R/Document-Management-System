<?php

namespace App\Models\Permission;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $table = 'actions';

    protected $fillable = ['name', 'key'];

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'action_id');
    }
}
