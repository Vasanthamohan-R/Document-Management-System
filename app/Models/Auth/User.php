<?php

namespace App\Models\Auth;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Department;
use App\Models\Location\City;
use App\Models\Location\Country;
use App\Models\Location\State;
use App\Models\Permission\Role;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    // ========== USER STATUS CONSTANTS ==========
    public const STATUS_ACTIVE = 1;

    public const STATUS_INACTIVE = 2;

    public const STATUS_DELETED = 3;

    public const STATUS_PASSWORD_UNCHANGED = 4;

    // ========== EMAIL VERIFICATION STATUS CONSTANTS ==========
    public const EMAIL_UNVERIFIED = 1;

    public const EMAIL_VERIFIED = 2;

    public const EMAIL_BLOCKED = 3;

    // ========== PHONE VERIFICATION STATUS CONSTANTS ==========
    public const PHONE_UNVERIFIED = 1;

    public const PHONE_VERIFIED = 2;

    public const PHONE_BLOCKED = 3;

    public const FALSE_ATTEMPT_COUNT = 3;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',

        // New fields
        'department_id',
        'dob',

        // Address
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'country_id',
        'state_id',
        'city_id',
        'pincode',

        // System
        'role_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        // 'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status'=>'integer',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',

        ];
    }

    /**
     * Get the role associated with the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    /**
     * Get the department that the user belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Check if user belongs to a specific department.
     */
    public function inDepartment($departmentName)
    {
        return $this->department && $this->department->name === $departmentName;
    }

    // Relationships
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id', 'id');
    }

    public function state()
    {
        return $this->belongsTo(State::class, 'state_id', 'id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id', 'id');
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permissionKey): bool
    {
        return $this->role && $this->role->hasPermission($permissionKey);
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is staff.
     */
    public function isStaff()
    {
        return $this->hasRole('staff');
    }

    /**
     * Check if user is manager.
     */
    public function isManager()
    {
        return $this->hasRole('manager');
    }

    /**
     * Check if user is active.
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * ----------------------------------------------------------------------------------------------------
     * Format date to DD-MM-YY HH:MM AM/PM
     * ----------------------------------------------------------------------------------------------------
     *
     * @param  string|null  $date
     * @return string
     *                ----------------------------------------------------------------------------------------------------
     */
    public function formatDate($date)
    {
        if (! $date) {
            return 'N/A';
        }

        return Carbon::parse($date)->format('d-m-y h:i A');
    }
}
