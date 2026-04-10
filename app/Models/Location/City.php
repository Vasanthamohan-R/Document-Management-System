<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $table = 'city';

    protected $fillable = [
        'state_id',
        'country_id',
        'name',
        'code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the state that owns the city.
     */
    public function state()
    {
        return $this->belongsTo(State::class, 'state_id', 'id');
    }

    /**
     * Get the country that owns the city.
     */
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    /**
     * Scope for active cities.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    /**
     * Get city name with code.
     */
    public function getNameWithCodeAttribute()
    {
        return $this->code ? "{$this->name} ({$this->code})" : $this->name;
    }
}
