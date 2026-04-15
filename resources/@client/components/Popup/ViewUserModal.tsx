import { cn } from "@/lib/utils";
import { User } from "@/pages/Management/UserManagement";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

interface Props {
    user: User | null;
    open: boolean;
    onClose: () => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "1":
        case "active":
            return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
        case "2":
        case "inactive":
            return "text-slate-500 bg-slate-100 dark:bg-slate-800/50";
        case "3":
        case "pending":
            return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
        case "4":
            return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
        default:
            return "";
    }
};

const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        "1": "Active",
        "2": "Inactive",
        "3": "Pending",
        "4": "Active",
    };
    return map[status] || status;
};

// Helper component for multi-line ellipsis
const EllipsisText: React.FC<{ text: string; lines?: number }> = ({
    text,
    lines = 2,
}) => {
    return (
        <div
            className={`text-sm text-slate-900 dark:text-white wrap-break-words max-w-[calc(100%-7rem)] line-clamp-${lines}`}
            style={{
                display: "-webkit-box",
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
            title={text}
        >
            {text}
        </div>
    );
};

const ViewUserModal: React.FC<Props> = ({ user, open, onClose }) => {
    return (
        <AnimatePresence>
            {open && user && (
                <motion.div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header */}
                        <div className="relative px-6 py-4 border-b border-slate-100 dark:border-slate-800 top-0 bg-white dark:bg-slate-900 z-10">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                User Details
                            </h2>
                        </div>

                        {/* Details Section - 2 Column Grid with Scroll */}
                        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* LEFT COLUMN */}
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Name
                                        </div>
                                        <EllipsisText
                                            text={user.name}
                                            lines={2}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Email
                                        </div>
                                        <div
                                            className="text-sm text-slate-900 dark:text-white break-all max-w-[calc(100%-7rem)]"
                                            title={user.email}
                                        >
                                            {user.email}
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Phone
                                        </div>
                                        <EllipsisText
                                            text={user.phone || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Role
                                        </div>
                                        <EllipsisText
                                            text={user.role_name || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* Department */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Department
                                        </div>
                                        <EllipsisText
                                            text={user.department_name || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Status
                                        </div>
                                        <div className="flex-1">
                                            <span
                                                className={cn(
                                                    "inline-block px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider",
                                                    getStatusColor(user.status),
                                                )}
                                            >
                                                {getStatusLabel(user.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Created At */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Created At
                                        </div>
                                        <EllipsisText
                                            text={user.created_at || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Date of Birth
                                        </div>
                                        <EllipsisText
                                            text={user.dob || "N/A"}
                                            lines={1}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="space-y-4">
                                    {/* Address Line 1 */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Address Line 1
                                        </div>
                                        <EllipsisText
                                            text={user.address_line_1 || "N/A"}
                                            lines={2}
                                        />
                                    </div>

                                    {/* Address Line 2 */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Address Line 2
                                        </div>
                                        <EllipsisText
                                            text={user.address_line_2 || "N/A"}
                                            lines={2}
                                        />
                                    </div>

                                    {/* Address Line 3 */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Address Line 3
                                        </div>
                                        <EllipsisText
                                            text={user.address_line_3 || "N/A"}
                                            lines={2}
                                        />
                                    </div>

                                    {/* Country */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Country
                                        </div>
                                        <EllipsisText
                                            text={user.country_name || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* State */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            State
                                        </div>
                                        <EllipsisText
                                            text={user.state_name || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* City */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            City
                                        </div>
                                        <EllipsisText
                                            text={user.city_name || "N/A"}
                                            lines={1}
                                        />
                                    </div>

                                    {/* Pincode */}
                                    <div className="flex">
                                        <div className="w-28 text-sm font-medium text-slate-500 shrink-0">
                                            Pincode
                                        </div>
                                        <EllipsisText
                                            text={user.pincode || "N/A"}
                                            lines={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewUserModal;