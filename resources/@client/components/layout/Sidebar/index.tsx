import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    LayoutDashboard,
    FileText,
    Upload,
    Folder,
    CheckCircle,
    History,
    ShieldCheck,
    Users,
    Archive,
    Settings,
    ChevronLeft,
    ChevronRight,
    File,
    Star,
    Clock,
    Cloud,
    Share2,
    HardDrive,
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

import logo from "@/assets/images/logo.png";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (value: boolean) => void;
}

interface MenuItem {
    icon: any;
    label: string;
    path: string;
    permission?: string; // Optional permission required for this item
    moduleId?: string; // Module ID for pageAccess checking
    children?: {
        label: string;
        path: string;
        icon: any;
        permission?: string;
    }[];
}

// Permission mapping for menu items
const menuPermissionMap: { [key: string]: string } = {
    "User Management": "users.view",
    "Role Management": "roles.view",
    Documents: "all_documents.view",
    "Upload Document": "upload.create",
    "Folders / Categories": "cloud.view",
    "Cloud Storage": "cloud.view",
    "Shared Files": "shared.view",
    "External Media": "external.view",
    Logs: "audit.view",
    "Audit Logs": "audit.view",
    "Contact Logs": "contact.view",
    Approvals: "approvals.view",
    "Version History": "versions.view",
    Archive: "archive.view",
    Settings: "settings.view",
};

const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },

    {
        icon: ShieldCheck,
        label: "Management",
        path: "/management",
        permission: "users.view",
        moduleId: "users", // For page access check
        children: [
            {
                label: "User Management",
                path: "/users",
                icon: Users,
                permission: "users.view",
            },
            {
                label: "Role Management",
                path: "/role",
                icon: ShieldCheck,
                permission: "roles.view",
            },
        ],
    },

    {
        icon: FileText,
        label: "Documents",
        path: "/documents",
        permission: "all_documents.view",
        moduleId: "documents", // For page access check
        children: [
            {
                label: "All Documents",
                path: "/documents",
                icon: File,
                permission: "all_documents.view",
            },
            {
                label: "Recent",
                path: "/documents/recent",
                icon: Clock,
                permission: "recent.view",
            },
            {
                label: "Starred",
                path: "/documents/starred",
                icon: Star,
                permission: "starred.view",
            },
        ],
    },

    {
        icon: Upload,
        label: "Upload Document",
        path: "/upload",
        permission: "upload.create",
    },

    {
        icon: Folder,
        label: "Folders / Categories",
        path: "/categories",
        permission: "cloud.view",
        moduleId: "cloud", // For page access check
        children: [
            {
                label: "Cloud Storage",
                path: "/categories/cloud",
                icon: Cloud,
                permission: "cloud.view",
            },
            {
                label: "Shared Files",
                path: "/categories/shared",
                icon: Share2,
                permission: "shared.view",
            },
            {
                label: "External Media",
                path: "/categories/external",
                icon: HardDrive,
                permission: "external.view",
            },
        ],
    },

    {
        icon: History,
        label: "Logs",
        path: "/logs",
        permission: "audit.view",
        moduleId: "audit", // For page access check
        children: [
            {
                label: "Audit Logs",
                path: "/logs/audit",
                icon: History,
                permission: "audit.view",
            },
            {
                label: "Contact Logs",
                path: "/logs/contact",
                icon: History,
                permission: "contact.view",
            },
        ],
    },

    {
        icon: CheckCircle,
        label: "Approvals",
        path: "/approvals",
        permission: "approvals.view",
    },
    {
        icon: History,
        label: "Version History",
        path: "/versions",
        permission: "versions.view",
    },
    {
        icon: Archive,
        label: "Archive",
        path: "/archive",
        permission: "archive.view",
    },
    {
        icon: Settings,
        label: "Settings",
        path: "/settings",
        permission: "settings.view",
    },
];

const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
}) => {
    const location = useLocation();
    const user = useSelector((state: any) => state.auth.user);
    const userPermissions = user?.permissions || [];

    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
    const [isMobile, setIsMobile] = React.useState(false);

    // Helper function to check if user has permission
    const hasPermission = (permission?: string): boolean => {
        if (!permission) return true; // No permission required
        // If no permissions array or it's empty, show everything (backward compatible)
        if (!userPermissions || userPermissions.length === 0) return true;
        return userPermissions.includes(permission);
    };

    // Helper function to check if page is accessible (pageAccess permission)
    // For now, always return true since pageAccess permissions are optional
    const hasPageAccess = (moduleId?: string): boolean => {
        if (!moduleId) return true;
        // TODO: When pageAccess system is fully initialized, check:
        // const pageAccessKey = `${moduleId}.pageAccess`;
        // return !userPermissions?.includes(pageAccessKey); // Hide only if explicitly disabled
        return true; // Show by default
    };

    // Filter menu items based on permissions and pageAccess
    const filteredMenuItems = menuItems
        .filter(
            (item) =>
                hasPermission(item.permission) && hasPageAccess(item.moduleId),
        )
        .map((item) => ({
            ...item,
            children: item.children?.filter((child) =>
                hasPermission(child.permission),
            ),
        }))
        .filter((item) => !item.children || item.children.length > 0); // Remove groups with no children

    React.useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreen();
        window.addEventListener("resize", checkScreen);

        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    const toggleExpand = (label: string) => {
        if (isCollapsed && !isMobile) {
            setIsCollapsed(false);
            setExpandedItem(label);
            return;
        }
        setExpandedItem((prev) => (prev === label ? null : label));
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isMobile ? (isMobileOpen ? 0 : -320) : 0,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out",
                    "bg-gradient-to-b from-[#33459b] via-[#2a3a8a] to-[#1e2a6a] text-white",
                    "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800",
                    isMobile
                        ? "w-72"
                        : isCollapsed
                          ? "w-20 items-center"
                          : "w-72",
                )}
            >
                {/* Logo Section */}
                <div
                    className={cn(
                        "flex items-center justify-between h-20 px-4 mb-2 relative",
                        (!isCollapsed || isMobile) &&
                            "border-b border-white/10",
                        isCollapsed && !isMobile && "justify-center px-0",
                    )}
                >
                    {(!isCollapsed || isMobile) && (
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={logo}
                                        className="h-10 w-10 object-contain drop-shadow-md"
                                        alt="Logo"
                                    />
                                    <div className="absolute bg-white/20 blur-sm rounded-full -z-10" />
                                </div>
                                <span className="text-xl font-extrabold tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                    RAFFTECH
                                </span>
                            </div>
                        </div>
                    )}

                    {!isMobile && !isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all shadow-inner border border-white/10 overflow-hidden"
                        >
                            <ChevronLeft
                                size={18}
                                className="group-hover:-translate-x-0.5 transition-transform z-10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}

                    {isCollapsed && !isMobile && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="absolute -right-3 top-8 group flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all shadow-inner border border-white/20 overflow-hidden z-50 group"
                        >
                            <ChevronRight
                                size={16}
                                className="group-hover:translate-x-0.5 transition-transform z-10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto mt-3 space-y-1 px-2">
                    {filteredMenuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isChildActive = item.children?.some(
                            (child) => location.pathname === child.path,
                        );
                        const isParentActive = isActive || isChildActive;

                        return (
                            <div key={item.label}>
                                {item.children ? (
                                    <>
                                        <button
                                            onClick={() =>
                                                toggleExpand(item.label)
                                            }
                                            className={cn(
                                                "group relative flex items-center gap-3 w-full transition-all duration-200",
                                                !isCollapsed || isMobile
                                                    ? "px-4 py-3 rounded-xl"
                                                    : "h-12 w-12 justify-center rounded-full mx-auto",
                                                isParentActive
                                                    ? "bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10"
                                                    : "text-white/70 hover:bg-white/10 hover:text-white",
                                                isCollapsed &&
                                                    !isMobile &&
                                                    "my-2",
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className={cn(
                                                        "absolute bg-white rounded-r-full",
                                                        !isCollapsed || isMobile
                                                            ? "left-0 w-1 h-6"
                                                            : "-left-px w-1 h-5",
                                                    )}
                                                />
                                            )}

                                            <item.icon
                                                size={
                                                    !isCollapsed || isMobile
                                                        ? 20
                                                        : 22
                                                }
                                                className={cn(
                                                    "transition-transform duration-200",
                                                    isParentActive &&
                                                        "scale-110",
                                                )}
                                            />

                                            {(!isCollapsed || isMobile) && (
                                                <>
                                                    <span className="flex-1 text-left">
                                                        {item.label}
                                                    </span>
                                                    <ChevronRight
                                                        size={14}
                                                        className={cn(
                                                            "text-white/50 transition-transform duration-300",
                                                            (expandedItem ===
                                                                item.label ||
                                                                isChildActive) &&
                                                                "rotate-90 text-white",
                                                        )}
                                                    />
                                                </>
                                            )}
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {(expandedItem === item.label ||
                                                isChildActive) &&
                                                (!isCollapsed || isMobile) && (
                                                    <motion.div
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: "auto",
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        className="mt-1 ml-4 border-l border-white/10 flex flex-col gap-1 pb-2 overflow-hidden"
                                                    >
                                                        {item.children.map(
                                                            (child) => {
                                                                const isSubActive =
                                                                    location.pathname ===
                                                                    child.path;
                                                                return (
                                                                    <NavLink
                                                                        key={
                                                                            child.path
                                                                        }
                                                                        to={
                                                                            child.path
                                                                        }
                                                                        onClick={() =>
                                                                            setIsMobileOpen(
                                                                                false,
                                                                            )
                                                                        }
                                                                        className={cn(
                                                                            "relative flex items-center gap-3 pl-6 pr-4 py-2.5 text-xs font-medium transition-all group rounded-lg mx-2",
                                                                            isSubActive
                                                                                ? "bg-white/15 text-white shadow-md border border-white/5 backdrop-blur-sm"
                                                                                : "text-white/50 hover:text-white hover:bg-white/5",
                                                                        )}
                                                                    >
                                                                        {isSubActive && (
                                                                            <motion.div
                                                                                layoutId="activeIndicator"
                                                                                className="absolute left-0 w-1 h-4 bg-white rounded-r-full -translate-x-[17px]"
                                                                            />
                                                                        )}
                                                                        <div
                                                                            className={cn(
                                                                                "absolute left-0 w-3 h-[1px] bg-white/20 -translate-x-full",
                                                                                isSubActive &&
                                                                                    "bg-white/50 w-4",
                                                                            )}
                                                                        />
                                                                        <child.icon
                                                                            size={
                                                                                14
                                                                            }
                                                                            className={cn(
                                                                                "transition-transform",
                                                                                isSubActive &&
                                                                                    "scale-110 text-white",
                                                                            )}
                                                                        />
                                                                        <span className="flex-1">
                                                                            {
                                                                                child.label
                                                                            }
                                                                        </span>
                                                                        {isSubActive && (
                                                                            <motion.div
                                                                                layoutId="subActiveDot"
                                                                                className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                                                            />
                                                                        )}
                                                                    </NavLink>
                                                                );
                                                            },
                                                        )}
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={({ isActive }) =>
                                            cn(
                                                "group relative flex items-center gap-3 w-full transition-all duration-200",
                                                !isCollapsed || isMobile
                                                    ? "px-4 py-3 rounded-xl"
                                                    : "h-12 w-12 justify-center rounded-full mx-auto",
                                                isActive
                                                    ? "bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/10"
                                                    : "text-white/70 hover:bg-white/10 hover:text-white",
                                                isCollapsed &&
                                                    !isMobile &&
                                                    "my-2",
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className={cn(
                                                            "absolute bg-white rounded-r-full",
                                                            !isCollapsed ||
                                                                isMobile
                                                                ? "left-0 w-1 h-6"
                                                                : "-left-px w-1 h-5",
                                                        )}
                                                    />
                                                )}
                                                <item.icon
                                                    size={
                                                        !isCollapsed || isMobile
                                                            ? 20
                                                            : 22
                                                    }
                                                    className={cn(
                                                        "transition-transform duration-200",
                                                        isActive && "scale-110",
                                                    )}
                                                />
                                                {(!isCollapsed || isMobile) && (
                                                    <span>{item.label}</span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </motion.aside>
        </>
    );
};

export default Sidebar;
