import React, { useEffect, useState } from "react";
import { History } from "lucide-react";
import api from "@/services/ApiService";
import Pagination from "@/components/Base/Pagination";

const ContactLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Fetch logs
    useEffect(() => {
        const abortController = new AbortController();

        const fetchLogs = async () => {
            setLoading(true);

            try {
                const payload: any = {
                    page: page,
                };

                const res = await api.post("/auth/contact-logs", payload, {
                    signal: abortController.signal,
                });

                setLogs(res.data.data || []);
                setLastPage(res.data.pagination.last_page);
                setPage(res.data.pagination.current_page);
                setTotalItems(res.data.pagination.total);
            } catch (error: any) {
                if (
                    error.name !== "CanceledError" &&
                    error.code !== "ERR_CANCELED"
                ) {
                    console.error("Error fetching contact logs:", error);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchLogs();

        return () => {
            abortController.abort();
        };
    }, [page]);

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header Section - Matches Audit Logs style */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History className="text-blue-600" size={28} />
                        Contact Logs
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        View all submitted contact form entries.
                    </p>
                </div>
            </div>

            {/* Card - Matches Audit Logs style */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-md border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden transition-colors duration-300">
                {/* Table Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar m-5">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                            <tr className="text-slate-500 dark:text-slate-200 uppercase tracking-widest font-bold text-[11px]">
                                <th className="px-4 py-4 w-[60px] first:rounded-tl-md">
                                    No.
                                </th>
                                <th className="px-4 py-4 min-w-[100px]">
                                    User ID
                                </th>
                                <th className="px-4 py-4">
                                    Name
                                </th>
                                <th className="px-4 py-4">
                                    Email
                                </th>
                                <th className="px-4 py-4">
                                    Message
                                </th>
                                <th className="px-4 py-4 w-[160px] last:rounded-tr-md">
                                    Created At
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-20 text-slate-400"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <tr
                                        key={index}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-all duration-300"
                                    >
                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {(page - 1) * itemsPerPage +
                                                index +
                                                1}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[100px]">
                                            {log.user_id || "Guest"}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {log.name}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {log.email}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                            {log.message}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 w-56">
                                            {log.created_at}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-widest text-[11px] text-slate-500">
                                                <History className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                                No contact logs found.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Matches Audit Logs style */}
                <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination
                        totalPages={lastPage}
                        currentPage={page}
                        onPageChange={(newPage: number) => setPage(newPage)}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        maxPagesToShow={5}
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactLogs;
