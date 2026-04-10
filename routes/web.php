<?php

use Illuminate\Support\Facades\Route;

// This route handles the initial load and any sub-paths for your SPA
Route::get('/{any?}', function () {
    return view('index'); // Ensure this matches your blade file name
})->where('any', '.*');
