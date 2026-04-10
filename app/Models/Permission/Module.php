<?php

namespace App\Models\Permission;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    const DASHBOARD = 1;

    const USER_MANAGEMENT = 2;

    const ROLE_MANAGEMENT = 3;

    const ALL_DOCUMENTS = 4;

    const RECENT = 5;

    const STARRED = 6;

    const UPLOAD_DOCUMENT = 7;

    const CLOUD_STORAGE = 8;

    const SHARED_FILES = 9;

    const EXTERNAL_MEDIA = 10;

    const AUDIT_LOGS = 11;

    const CONTACT_LOGS = 12;

    const APPROVALS = 13;

    const VERSION_HISTORY = 14;

    const ARCHIVE = 15;

    const SETTINGS = 16;

    // Authentication Related Constants
    const AUTH_REGISTRATION = 17;

    const AUTH_LOGIN = 18;

    const AUTH_LOGOUT = 19;

    const AUTH_FORGOT_PASSWORD = 20;

    const AUTH_RESET_PASSWORD = 21;

    const AUTH_CHANGE_PASSWORD = 22;

    const AUTH_VERIFY_OTP = 23;

    const AUTH_RESEND_OTP = 24;

    const AUTH_REFRESH_TOKEN = 25;

    const AUTH_UPDATE_PROFILE = 26;

    const AUTH_GET_PROFILE = 27;

    use HasFactory;

    protected $table = 'modules';

    protected $fillable = ['group_id', 'name', 'key', 'sort_order'];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'module_id');
    }
}
