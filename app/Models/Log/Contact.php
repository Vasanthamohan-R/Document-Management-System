<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $table = 'contact_us';

    protected $fillable = ['user_id', 'name', 'email', 'message'];
}
