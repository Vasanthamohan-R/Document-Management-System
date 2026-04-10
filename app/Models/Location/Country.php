<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $table = 'country';

    protected $fillable = [
        'name',
        'alpha_2',
        'alpha_3',
        'country_code',
        'iso_3166_2',
        'region',
        'sub_region',
        'intermediate_region',
        'region_code',
        'sub_region_code',
        'intermediate_region_code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the states for the country.
     */
    public function states()
    {
        return $this->hasMany(State::class, 'country_id', 'id');
    }

    /**
     * Get the cities for the country (through states).
     */
    public function cities()
    {
        return $this->hasManyThrough(City::class, State::class, 'country_id', 'state_id');
    }

    /**
     * Scope for active countries.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }
}
