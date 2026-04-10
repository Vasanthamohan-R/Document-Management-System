<?php

namespace App\Http\Middleware;

use App\Models\Auth\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /** * Handle an incoming request. * * @param \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse) $next * @param string ...$permissions * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse */
    public function handle(Request $request, Closure $next, ...$permissions)
    { /** @var User $user */ $user = Auth::user();
        if (! $user) {
            return response()->json(['status' => 'failed', 'message' => 'Unauthorized - User not authenticated'], 401);
        }
        // Super admin and super_admin roles bypass all permission checks
        if ($user->role && ($user->role->name === 'super_admin' || $user->role->name === 'Super Admin')) {
            return $next($request);
        } // Check if user has any of the required permissions
        if (! $user->hasAnyPermission($permissions)) {
            return response()->json(['status' => 'failed', 'message' => 'Forbidden - Insufficient permissions', 'required_permissions' => $permissions], 403);
        }

        return $next($request);
    }
}
