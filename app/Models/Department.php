<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'department';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get the users that belong to this department.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'department');
    }

    /**
     * Scope for active departments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', '1');
    }

    /**
     * Scope for inactive departments.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', '2');
    }

    /**
     * Check if department is active.
     */
    public function isActive()
    {
        return $this->status === '1';
    }

    /**
     * Check if department is inactive.
     */
    public function isInactive()
    {
        return $this->status === '2';
    }

    /**
     * Get status label attribute.
     */
    public function getStatusLabelAttribute()
    {
        return $this->status === '1' ? 'Active' : 'Inactive';
    }
}
