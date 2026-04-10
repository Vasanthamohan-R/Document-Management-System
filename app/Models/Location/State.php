<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    use HasFactory;

    protected $table = 'state';

    protected $fillable = [
        'country_id',
        'name',
        'name_ssm',
        'code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the country that owns the state.
     */
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    /**
     * Get the cities for the state.
     */
    public function cities()
    {
        return $this->hasMany(City::class, 'state_id', 'id');
    }

    /**
     * Scope for active states.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    /**
     * Get state name with code.
     */
    public function getNameWithCodeAttribute()
    {
        return $this->code ? "{$this->name} ({$this->code})" : $this->name;
    }
}
