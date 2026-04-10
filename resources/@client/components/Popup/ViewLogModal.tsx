import React, { useState } from "react";
import { History, X, Clock, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AuditLogItem } from "@/types/log";

interface ViewLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: AuditLogItem | null;
}

const ViewLogModal: React.FC<ViewLogModalProps> = ({
    isOpen,
    onClose,
    log,
}) => {
    const [showFullIp, setShowFullIp] = useState(false);

    if (!isOpen || !log) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Audit Log Details
                </h2>

                <div className="grid grid-cols-2 gap-6">
                    {[
                        { label: "E-Mail", value: log.email },
                        { label: "Module", value: log.module },
                        { label: "Client ID", value: log.client_id },
                        { label: "Purpose", value: log.action },

                        // ✅ IP WITH TOGGLE
                        {
                            label: "IP Address",
                            value: (
                                <div className="flex items-center gap-2">
                                    <span>
                                        {showFullIp
                                            ? log.full_ip
                                            : log.ip_address}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setShowFullIp(!showFullIp)
                                        }
                                        className="text-slate-400 hover:text-blue-600 transition"
                                    >
                                        {showFullIp ? (
                                            <EyeOff className="h-4 w-4" /> 
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            ),
                        },

                        { label: "Message", value: log.message },

                       
                        { label: "Created At", value: log.created_at },
                    ].map((item, index) => (
                        <div key={index}>
                            <div className="flex items-start gap-3 text-sm">
                                <span className="text-slate-400 font-semibold min-w-[120px]">
                                    {item.label}
                                </span>

                                <span className="text-slate-700 dark:text-slate-200 break-words whitespace-pre-wrap flex-1">
                                    {item.value ? item.value : "N/A"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 grid grid-cols-2 gap-6">
                    {[
                        { label: "Old Value", value: log.old_value },
                        { label: "New Value", value: log.new_value },
                    ].map((item, index) => (
                        <div key={index}>
                            <div className="flex items-start gap-3 text-sm">
                                <span className="text-slate-400 font-semibold min-w-[120px]">
                                    {item.label}
                                </span>

                                <span className="text-slate-700 dark:text-slate-200 break-all whitespace-pre-wrap flex-1 overflow-hidden">
                                    {item.value ? item.value : "N/A"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {(log.custom1 || log.custom2) && (
                    <div className="mt-6 pt-4 grid grid-cols-2 gap-6">
                        {[
                            log.custom1 && {
                                label: "Custom 1",
                                value: log.custom1,
                            },
                            log.custom2 && {
                                label: "Custom 2",
                                value: log.custom2,
                            },
                        ]
                            .filter(Boolean)
                            .map((item: any, index) => (
                                <div key={index}>
                                    <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm break-words whitespace-pre-wrap">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewLogModal;
