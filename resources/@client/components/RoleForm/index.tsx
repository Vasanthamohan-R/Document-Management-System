import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

interface Feature {
    id: string;
    label: string;
    enabled: boolean;
}

interface PermissionModule {
    id: string;
    title: string;
    group: string;
    icon: any;
    pageAccessFeatureId?: string;
    features: Feature[];
}

const RoleForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const roleId = id ? parseInt(id, 10) : null;
    const isEditMode = !!roleId;

    const [roleData, setRoleData] = useState({
        name: "",
        description: "",
    });

    const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const permissionIcons: { [key: string]: any } = {
        users: Users,
        roles: ShieldAlert,
        settings: Settings,
        dashboard: LayoutDashboard,
        documents: FileText,
    };

    useEffect(() => {
        const loadAndFetchData = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);

                // Step 1: Load generic permission schema
                const res = await api.get("/auth/permission-list");

                if (res.data.status === "success") {
                    let modules: PermissionModule[] = res.data.data.map((module: any) => {
                        // Find the official page access feature from backend
                        const pageAccessFeature = module.features.find((f: any) => 
                            f.id.endsWith(".pageAccess") || 
                            f.id.endsWith(".access") ||
                            f.id === `${module.id}.access`
                        );
                        
                        return {
                            ...module,
                            group: module.group || 'Other',
                            icon: permissionIcons[module.id] || ShieldCheck,
                            pageAccessFeatureId: pageAccessFeature?.id,
                            features: module.features.map((feature: any) => ({
                                ...feature,
                                enabled: false,
                            })),
                        };
                    });

                    // Step 2: If editing, fetch existing role data and sync permissions
                    if (isEditMode) {
                        try {
                            const roleRes = await api.post("/auth/role-view", { id: roleId });

                            if (roleRes.data.status === "success") {
                                const role = roleRes.data.data;
                                setRoleData({
                                    name: role.name,
                                    description: role.description ?? "",
                                });

                                if (role.permissions && role.permissions.length > 0) {
                                    modules = modules.map((module) => {
                                        return {
                                            ...module,
                                            features: module.features.map((feature) => {
                                                const saved = role.permissions.find(
                                                    (p: any) => p.key_name === feature.id
                                                );
                                                return {
                                                    ...feature,
                                                    enabled: saved ? Boolean(saved.enabled) : false,
                                                };
                                            }),
                                        };
                                    });
                                }
                            } else {
                                throw new Error(roleRes.data.message);
                            }
                        } catch (err: any) {
                            Alert.Error(err.response?.data?.message || "Failed to load role details.");
                            navigate("/role");
                            return;
                        }
                    }

                    setPermissionModules(modules);
                } else {
                    throw new Error(res.data.message || "Failed to load permissions.");
                }
            } catch (err: any) {
                const msg = err.message || err.response?.data?.message || "Failed to load permissions.";
                setLoadError(msg);
                Alert.Error(msg);
            } finally {
                setIsLoading(false);
            }
        };

        loadAndFetchData();
    }, [roleId, isEditMode, navigate]);

    const togglePermission = (moduleId: string, featureId: string) => {
        setPermissionModules((prev) =>
            prev.map((mod) => {
                if (mod.id === moduleId) {
                    return {
                        ...mod,
                        features: mod.features.map((f) =>
                            f.id === featureId ? { ...f, enabled: !f.enabled } : f
                        ),
                    };
                }
                return mod;
            })
        );
    };

    const handleSaveRole = async () => {
        if (!roleData.name.trim()) {
            Alert.Warning("Role name is required.");
            return;
        }

        if (!permissionModules || permissionModules.length === 0) {
            Alert.Warning("No permissions available to save.");
            return;
        }

        try {
            const endpoint = isEditMode ? "/auth/role-update" : "/auth/role-create";
            const payload = {
                ...(isEditMode && { id: roleId }),
                name: roleData.name,
                description: roleData.description,
                permissions: permissionModules,
            };

            const res = await api.post(endpoint, payload);

            if (res.data.status === "success") {
                await Alert.Success(res.data.message);
                navigate("/role");
            } else {
                Alert.Error(res.data.message);
            }
        } catch (err: any) {
            Alert.Error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} role.`);
        }
    };

    // Extract distinct groups for categorised layout
    const groups = Array.from(new Set(permissionModules.map((m) => m.group))).sort();

    return (
        <div className="flex flex-col h-full gap-8 py-4 px-2">
            
            {/* Header Section */}
            <div className="flex flex-col gap-4 shrink-0">
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

                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="text-blue-600 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm" size={32} />
                                {isEditMode ? "Edit Role" : "Create New Role"}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {isEditMode
                                    ? "Modify permissions and details for this role."
                                    : "Define user access levels and feature availability."}
                            </p>
                        </div>
                    </div>
                    
                    <Button
                        variant="primary"
                        icon={Send}
                        onClick={handleSaveRole}
                        className="h-11 px-8 rounded-xl shadow-lg shadow-blue-500/10 font-bold"
                    >
                        {isEditMode ? "Update Role" : "Save Role"}
                    </Button>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 flex flex-col gap-8 min-h-0">
                
                {/* Role Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl shrink-0">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                            Role Name
                        </label>
                        <input
                            type="text"
                            value={roleData.name}
                            onChange={(e) => setRoleData((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Finance Moderator"
                            className="h-12 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                            Role Description
                        </label>
                        <input
                            type="text"
                            value={roleData.description}
                            onChange={(e) => setRoleData((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Briefly describe what this role does..."
                            className="h-12 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                        />
                    </div>
                </div>

                {/* Permissions Grouping */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <ShieldCheck className="h-12 w-12 text-slate-300" />
                                <p className="text-slate-400 font-medium">Loading permissions schema...</p>
                            </div>
                        </div>
                    ) : loadError ? (
                        <div className="text-center py-20 text-red-500 font-medium bg-white dark:bg-slate-900 rounded-3xl">
                            Error connecting to backend: {loadError}
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {groups.map((groupName) => (
                                <div key={groupName} className="space-y-4">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2">
                                        {groupName}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 tracking-tight">
                                        {permissionModules
                                            .filter((m) => m.group === groupName)
                                            .map((module) => {
                                                // Separate standard features from the Page Access feature
                                                const regularFeatures = module.features.filter(
                                                    (f) => f.id !== module.pageAccessFeatureId
                                                );
                                                const pageAccessActive =
                                                    module.features.find((f) => f.id === module.pageAccessFeatureId)?.enabled ?? false;

                                                return (
                                                    <div
                                                        key={module.id}
                                                        className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl hover:shadow-sm border border-slate-100 hover:border-slate-200 dark:border-slate-800/80 transition-all overflow-hidden"
                                                    >
                                                        {/* Module Header */}
                                                        <div className="flex flex-col gap-3 p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-blue-600">
                                                                        <module.icon size={18} />
                                                                    </div>
                                                                    <h3 className="font-bold text-slate-700 dark:text-slate-200">
                                                                        {module.title}
                                                                    </h3>
                                                                </div>

                                                                {/* True Dynamic Page Access Toggle */}
                                                                {module.pageAccessFeatureId && (
                                                                    <button
                                                                        onClick={() => togglePermission(module.id, module.pageAccessFeatureId!)}
                                                                        className={cn(
                                                                            "w-[34px] h-[20px] rounded-full relative transition-colors duration-200",
                                                                            pageAccessActive ? "bg-emerald-500 shrink-0" : "bg-slate-300 dark:bg-slate-700 shrink-0"
                                                                        )}
                                                                        title="Toggle Page Access"
                                                                    >
                                                                        <div
                                                                            className={cn(
                                                                                "absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all shadow-sm",
                                                                                pageAccessActive ? "left-[16px]" : "left-[2px]"
                                                                            )}
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Select All */}
                                                            {regularFeatures.length > 0 && (
                                                                <div className="flex items-center justify-between mt-1">
                                                                    <span className="text-xs font-medium text-slate-400">Granular Actions</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            const allEnabled = regularFeatures.every(f => f.enabled);
                                                                            // Toggle only the regular features, not the page access
                                                                            const newModules = permissionModules.map(mod => {
                                                                                if (mod.id === module.id) {
                                                                                    return {
                                                                                        ...mod,
                                                                                        features: mod.features.map(f => 
                                                                                            f.id !== mod.pageAccessFeatureId ? { ...f, enabled: !allEnabled } : f
                                                                                        )
                                                                                    };
                                                                                }
                                                                                return mod;
                                                                            });
                                                                            setPermissionModules(newModules);
                                                                        }}
                                                                        className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider"
                                                                    >
                                                                        {regularFeatures.every(f => f.enabled) ? "Deselect All" : "Select All"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Standard Features */}
                                                        <div className="flex flex-col p-2 bg-white dark:bg-slate-900">
                                                            {regularFeatures.map((feature) => (
                                                                <div
                                                                    key={feature.id}
                                                                    onClick={() => togglePermission(module.id, feature.id)}
                                                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group/feat"
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            "text-[13px] font-medium transition-colors",
                                                                            feature.enabled ? "text-slate-700 dark:text-slate-200" : "text-slate-400"
                                                                        )}
                                                                    >
                                                                        {feature.label}
                                                                    </span>
                                                                    <div
                                                                        className={cn(
                                                                            "w-[34px] h-[20px] rounded-full relative transition-colors duration-300",
                                                                            feature.enabled ? "bg-blue-600 shrink-0" : "bg-slate-200 dark:bg-slate-800 shrink-0"
                                                                        )}
                                                                    >
                                                                        <div
                                                                            className={cn(
                                                                                "absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                                feature.enabled ? "left-[16px]" : "left-[2px]"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {regularFeatures.length === 0 && (
                                                                <p className="text-[11px] text-center text-slate-400 py-3 font-medium">No granular actions configured.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleForm;
