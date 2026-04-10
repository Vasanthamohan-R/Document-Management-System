<?php

namespace App\Models\Permission;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $table = 'groups';

    protected $fillable = ['name', 'key', 'sort_order'];

    public function modules()
    {
        return $this->hasMany(Module::class, 'group_id');
    }
}
