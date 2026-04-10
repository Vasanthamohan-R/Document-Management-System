import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ShieldCheck,
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    ShieldAlert,
    Send,
    ChevronLeft,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Alert } from "@/utils/Alert/Alert";
import api from "@/services/ApiService";

interface PermissionGroup {
    id: string;
    title: string;
    icon: any;
    pageAccess?: boolean; // New: control if page is visible
    features: {
        id: string;
        label: string;
        enabled: boolean;
    }[];
}

const EditRole: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [roleData, setRoleData] = useState({
        name: "",
        description: "",
    });

    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
        [],
    );

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const permissionIcons: { [key: string]: any } = {
        users: Users,
        roles: ShieldAlert,
        settings: Settings,
        dashboard: LayoutDashboard,
        documents: FileText,
    };

    // Combined effect: Load permissions schema, then fetch role data if editing
    useEffect(() => {
        const loadAndFetchData = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);

                // Step 1: Load permission schema
                const res = await api.get("/auth/roles/permissions");

                if (res.data.status === "success") {
                    const groups: PermissionGroup[] = res.data.data.map(
                        (group: PermissionGroup) => ({
                            ...group,
                            icon: permissionIcons[group.id] || ShieldCheck,
                            pageAccess: group.pageAccess ?? true,
                            features: group.features.map((feature: any) => ({
                                ...feature,
                                enabled: feature.enabled ?? false,
                            })),
                        }),
                    );

                    // Step 2: If editing a role, fetch its permissions
                    if (id) {
                        try {
                            const roleRes = await api.post("/auth/roles/view", {
                                id,
                            });

                            if (roleRes.data.status === "success") {
                                const role = roleRes.data.data;

                                setRoleData({
                                    name: role.name,
                                    description: role.description ?? "",
                                });

                                // Apply role permissions to schema
                                if (
                                    role.permissions &&
                                    role.permissions.length > 0
                                ) {
                                    const updatedGroups = groups.map(
                                        (group) => {
                                            const pageAccessPerm =
                                                role.permissions.find(
                                                    (p: any) =>
                                                        p.key_name ===
                                                        `${group.id}.pageAccess`,
                                                );

                                            return {
                                                ...group,
                                                pageAccess: pageAccessPerm
                                                    ? Boolean(
                                                          pageAccessPerm.enabled,
                                                      )
                                                    : true,
                                                features: group.features.map(
                                                    (feature) => {
                                                        const saved =
                                                            role.permissions.find(
                                                                (p: any) =>
                                                                    p.key_name ===
                                                                    feature.id,
                                                            );
                                                        return {
                                                            ...feature,
                                                            enabled: saved
                                                                ? Boolean(
                                                                      saved.enabled,
                                                                  )
                                                                : false,
                                                        };
                                                    },
                                                ),
                                            };
                                        },
                                    );
                                    setPermissionGroups(updatedGroups);
                                } else {
                                    setPermissionGroups(groups);
                                }
                            } else {
                                await Alert.Error(roleRes.data.message);
                                navigate("/role");
                            }
                        } catch (err: any) {
                            const msg =
                                err.response?.data?.message ||
                                "Failed to load role.";
                            await Alert.Error(msg);
                            navigate("/role");
                        }
                    } else {
                        setPermissionGroups(groups);
                    }
                } else {
                    setLoadError(
                        res.data.message || "Failed to load permissions.",
                    );
                    Alert.Error(
                        res.data.message || "Failed to load permissions.",
                    );
                }
            } catch (err: any) {
                const msg =
                    err.response?.data?.message ||
                    "Failed to load permissions.";
                setLoadError(msg);
                Alert.Error(msg);
            } finally {
                setIsLoading(false);
            }
        };

        loadAndFetchData();
    }, [id, navigate]);

    const togglePermission = (groupId: string, featureId: string) => {
        setPermissionGroups((prev) =>
            prev.map((group) => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        features: group.features.map((f) =>
                            f.id === featureId
                                ? { ...f, enabled: !f.enabled }
                                : f,
                        ),
                    };
                }
                return group;
            }),
        );
    };

    
    const toggleAllFeatures = (groupId: string, enabled: boolean) => {
        setPermissionGroups((prev) =>
            prev.map((group) => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        features: group.features.map((feature) => ({
                            ...feature,
                            enabled: enabled,
                        })),
                    };
                }
                return group;
            }),
        );
    };

   
    const togglePageAccess = (groupId: string) => {
        setPermissionGroups((prev) =>
            prev.map((group) => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        pageAccess: !group.pageAccess,
                    };
                }
                return group;
            }),
        );
    };

    const handleUpdateRole = async () => {
        if (!roleData.name.trim()) {
            Alert.Warning("Role name is required.");
            return;
        }

        // Validation: Check if at least some permissions are configured
        if (!permissionGroups || permissionGroups.length === 0) {
            Alert.Warning("No permissions available to save.");
            return;
        }

        try {
            const res = await api.post("/auth/roles/update", {
                id,
                name: roleData.name,
                description: roleData.description,
                permissions: permissionGroups,
            });

            if (res.data.status === "success") {
                await Alert.Success(res.data.message);
                navigate("/role");
            } else {
                Alert.Error(res.data.message);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to update role.";
            Alert.Error(msg);
        }
    };

    return (
        <div className="flex flex-col h-full gap-8 py-4 px-2">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate("/role")}
                    className="flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors w-fit group"
                >
                    <ChevronLeft
                        size={18}
                        className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    <span className="text-sm font-medium">Back to Roles</span>
                </button>

                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="text-blue-600" size={28} />
                            Edit Role
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Modify permissions and details for this role.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        icon={Send}
                        onClick={handleUpdateRole}
                        className="h-11 px-8 rounded-xl shadow-lg shadow-blue-500/10 font-bold"
                    >
                        Update Role
                    </Button>
                </div>
            </div>

            {/* Role Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl shrink-0">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                        Role Name
                    </label>
                    <input
                        type="text"
                        value={roleData.name}
                        onChange={(e) =>
                            setRoleData((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                        placeholder="e.g. Finance Moderator"
                        className="h-12 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                        Role Description
                    </label>
                    <input
                        type="text"
                        value={roleData.description}
                        onChange={(e) =>
                            setRoleData((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                        placeholder="Briefly describe what this role does..."
                        className="h-12 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* Page Cards Grid */}
            <div className="flex-1 min-h-0">
                <h2 className="text-xs font-bold text-slate-400 uppercase mb-4 ml-1">
                    Feature Permissions
                </h2>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
                        {/* Loading Skeleton */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden animate-pulse"
                            >
                                {/* Skeleton Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
                                    <div className="flex gap-3 items-center flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                                    </div>
                                </div>

                                {/* Skeleton Features */}
                                <div className="flex flex-col p-2 gap-2">
                                    {[1, 2, 3].map((j) => (
                                        <div
                                            key={j}
                                            className="flex items-center justify-between p-3.5 rounded-2xl"
                                        >
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-11" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : loadError ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-red-500">Error: {loadError}</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
                        {permissionGroups.map((group) => (
                            <div
                                key={group.id}
                                className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
                                    <div className="flex gap-3 items-center flex-1">
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-blue-600 shadow-sm">
                                            <group.icon size={18} />
                                        </div>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200">
                                            {group.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Page Access Toggle */}
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Page Access
                                            </span>
                                            <button
                                                onClick={() =>
                                                    togglePageAccess(group.id)
                                                }
                                                className={cn(
                                                    "w-8 h-5 rounded-full relative transition-colors duration-200",
                                                    group.pageAccess
                                                        ? "bg-green-500"
                                                        : "bg-slate-300 dark:bg-slate-600",
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm",
                                                        group.pageAccess
                                                            ? "left-4"
                                                            : "left-0.5",
                                                    )}
                                                />
                                            </button>
                                        </div>

                                        {/* Select All Button */}
                                        <button
                                            onClick={() => {
                                                const allEnabled =
                                                    group.features.every(
                                                        (f) => f.enabled,
                                                    );
                                                toggleAllFeatures(
                                                    group.id,
                                                    !allEnabled,
                                                );
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
                                        >
                                            {group.features.every(
                                                (f) => f.enabled,
                                            )
                                                ? "Deselect All"
                                                : "Select All"}
                                        </button>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="flex flex-col p-2">
                                    {group.features.map((feature) => (
                                        <div
                                            key={feature.id}
                                            onClick={() =>
                                                togglePermission(
                                                    group.id,
                                                    feature.id,
                                                )
                                            }
                                            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all group/feat"
                                        >
                                            <span
                                                className={cn(
                                                    "text-sm font-medium transition-colors",
                                                    feature.enabled
                                                        ? "text-slate-700 dark:text-slate-200"
                                                        : "text-slate-400",
                                                )}
                                            >
                                                {feature.label}
                                            </span>
                                            <div
                                                className={cn(
                                                    "w-11 h-6 rounded-full relative transition-colors duration-300",
                                                    feature.enabled
                                                        ? "bg-blue-600"
                                                        : "bg-slate-200 dark:bg-slate-800",
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                        feature.enabled
                                                            ? "left-6"
                                                            : "left-1",
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Placeholder for future groups */}
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl min-h-[200px]">
                            <Settings
                                className="text-slate-300 mb-2"
                                size={32}
                            />
                            <p className="text-[11px] font-bold text-slate-400 uppercase">
                                System Settings Page
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Coming Soon
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditRole;
