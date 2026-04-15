import { useAppSelector } from '@/stores/hooks';

export const usePermissions = () => {
    const user = useAppSelector((state) => state.auth.user);
    const userPermissions = user?.permissions || [];

    /**
     * Checks if the user has a specific permission key OR if they are a super_admin.
     * @param permissionKey The exact key_name to check (e.g. 'dashboard.view_document_summary')
     * @returns boolean
     */
    const hasPermission = (permissionKey: string): boolean => {
        if (!user) return false;
        
        return userPermissions.includes(permissionKey);
    };

    /**
     * Checks if the user has ANY of the given permission keys.
     * @param permissionKeys Array of keys to check
     * @returns boolean
     */
    const hasAnyPermission = (permissionKeys: string[]): boolean => {
        if (!user) return false;

        return permissionKeys.some(key => userPermissions.includes(key));
    };

    /**
     * Checks if the user has ALL of the given permission keys.
     * @param permissionKeys Array of keys to check
     * @returns boolean
     */
    const hasAllPermissions = (permissionKeys: string[]): boolean => {
        if (!user) return false;

        return permissionKeys.every(key => userPermissions.includes(key));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        userPermissions
    };
};
