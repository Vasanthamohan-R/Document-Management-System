import React, { useEffect, useState, useRef } from "react";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    History,
    User,
    EyeOff,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import api from "@/services/ApiService";
import Pagination from "@/components/Base/Pagination";

// Types
import { AuditLogItem } from "@/types/log";

// Components
import ViewLogModal from "@/components/Popup/ViewLogModal";

const AuditLogsPage: React.FC = () => {
    // STATES
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [visibleIps, setVisibleIps] = useState<{ [key: number]: boolean }>(
        {},
    );

    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState("all");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: "",
        searchBy: "all",
        statusFilter: "all",
        startDate: null as Date | null,
        endDate: null as Date | null,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const isInitialMount = useRef(true);

    // ✅ FETCH API
    const fetchLogs = async (page = 1) => {
        setLoading(true);

        try {
            const res = await api.post("/auth/audit-logs", {
                page: page,
                perPage: itemsPerPage,
                search: appliedFilters.searchTerm,
                searchBy: appliedFilters.searchBy,
                status:
                    appliedFilters.statusFilter !== "all"
                        ? appliedFilters.statusFilter
                        : "",
                startDate: appliedFilters.startDate,
                endDate: appliedFilters.endDate,
            });

            const response = res.data;

            const logsArray = Array.isArray(response.data) ? response.data : [];

            const mappedLogs: AuditLogItem[] = logsArray.map((log: any) => {
                const fullIp = log.ip_address;

                return {
                    id: log.id,
                    client_id: log.client_id ?? "N/A",
                    module: log.module,
                    action: log.action,
                    message: log.message,
                    email: log.email,
                    purpose: log.action,

                    status:
                        log.status === 1 || log.status === "1"
                            ? "Success"
                            : log.status === 2 || log.status === "2"
                              ? "Failed"
                              : "Warning",

                    created_at: log.created_at,

                    ip_address: fullIp ? "********" : "N/A",
                    full_ip: fullIp,

                    old_value: log.old_value,
                    new_value: log.new_value,
                    custom1: log.custom1,
                    custom2: log.custom2,
                };
            });

            setLogs(mappedLogs);
            setCurrentPage(response.pagination?.current_page || 1);
            setTotalPages(response.pagination?.last_page || 1);
            setTotalItems(response.pagination?.total || 0);
        } catch (error) {
            console.error(error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage, itemsPerPage]);

    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
        fetchLogs(1);
    };

    const handleApplyFilters = () => {
        let finalStartDate: Date | null = null;
        let finalEndDate: Date | null = null;

        const today = new Date();

        switch (dateRange) {
            case "7d":
                finalStartDate = new Date();
                finalStartDate.setDate(today.getDate() - 7);
                finalEndDate = today;
                break;

            case "30d":
                finalStartDate = new Date();
                finalStartDate.setDate(today.getDate() - 30);
                finalEndDate = today;
                break;

            case "1y":
                const lastYear = today.getFullYear() - 1;
                finalStartDate = new Date(lastYear, 0, 1);
                finalEndDate = new Date(lastYear, 11, 31);
                break;

            case "custom":
                finalStartDate = startDate;
                finalEndDate = endDate;
                break;

            case "all":
            default:
                finalStartDate = null;
                finalEndDate = null;
                break;
        }

        setAppliedFilters({
            searchTerm,
            searchBy,
            statusFilter,
            startDate: finalStartDate,
            endDate: finalEndDate,
        });

        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSearchBy("email");
        setStatusFilter("all");
        setStartDate(null);
        setEndDate(null);
        setDateRange("all");

        setAppliedFilters({
            searchTerm: "",
            searchBy: "email",
            statusFilter: "all",
            startDate: null,
            endDate: null,
        });

        setCurrentPage(1);
    };

    const handleViewDetails = (log: AuditLogItem) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const toggleIpVisibility = (id: number) => {
        setVisibleIps((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History className="text-blue-600" size={28} />
                        Audit Logs
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track and monitor all user activities within the system.
                    </p>
                </div>
            </div>

            {/* Card */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden">
                {/* Filter Bar */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 min-w-[140px]">
                        <Select
                            className="h-10 w-full rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                            options={[
                                { label: "Search By All", value: "all" },
                                {
                                    label: "Search By Client ID",
                                    value: "client_id",
                                },
                                { label: "Search By Module", value: "module" },
                                { label: "Search By E-Mail", value: "email" },
                            ]}
                        />
                    </div>

                    <div className="relative flex-1 max-w-md min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${searchBy === "all" ? "email, client ID, module" : searchBy}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleApplyFilters()
                            }
                            className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <Select
                            className="h-10 min-w-[140px] rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { label: "All Status", value: "all" },
                                { label: "Success", value: "Success" },
                                { label: "Failed", value: "Failed" },
                            ]}
                        />

                        <Select
                            className="h-10 min-w-[140px] rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                            value={dateRange}
                            onChange={(e) => {
                                setDateRange(e.target.value);
                                if (e.target.value !== "custom") {
                                    setStartDate(null);
                                    setEndDate(null);
                                }
                            }}
                            options={[
                                { label: "All Time", value: "all" },
                                { label: "Last 7 Days", value: "7d" },
                                { label: "Last 30 Days", value: "30d" },
                                { label: "Last Year", value: "1y" },
                                { label: "Custom Range", value: "custom" },
                            ]}
                        />

                        {dateRange === "custom" && (
                            <div className="flex items-center gap-2">
                                <DatePicker
                                    selectsRange={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(
                                        update: [Date | null, Date | null],
                                    ) => {
                                        const [start, end] = update;
                                        setStartDate(start);
                                        setEndDate(end);
                                    }}
                                    placeholderText="Select date range"
                                    className="h-10 w-56 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                                    dateFormat="yyyy-MM-dd"
                                    isClearable={true}
                                    monthsShown={2}
                                    maxDate={new Date()}
                                    popperPlacement="bottom-start"
                                />
                            </div>
                        )}

                        <Button
                            variant="primary"
                            icon={Filter}
                            onClick={handleApplyFilters}
                            className="h-10 px-4 rounded-md"
                        >
                            Submit
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto no-scrollbar m-5">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold">
                                    No.
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold min-w-[150px]">
                                    E-Mail
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold">
                                    Client ID
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold">
                                    Module
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold">
                                    Purpose
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold">
                                    Created At
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase font-bold">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-center py-20 text-slate-400"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <tr
                                        key={`${log.id}-${index}`}
                                        className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all duration-300"
                                    >
                                        <td className="px-4 py-2 text-md text-slate-400">
                                            {(currentPage - 1) * itemsPerPage +
                                                index +
                                                1}
                                        </td>

                                        <td className="px-4 py-2 text-sm text-slate-500 min-w-[150px]">
                                            {log.email || "N/A"}
                                        </td>

                                        <td className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 w-56">
                                            {log.client_id}
                                        </td>

                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="truncate text-sm font-bold text-slate-600 dark:text-slate-400 w-24">
                                                    {log.module}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2 text-sm text-slate-500 w-72">
                                            {log.action}
                                        </td>

                                        <td className="px-4 py-2 text-sm text-slate-500">
                                            {log.created_at}
                                        </td>

                                        <td className="px-6 py-2 text-left">
                                            <button
                                                onClick={() =>
                                                    handleViewDetails(log)
                                                }
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-950">
                                                <Filter className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-medium">
                                                No logs found matching your
                                                filters.
                                            </p>
                                            <Button
                                                variant="ghost"
                                                onClick={handleResetFilters}
                                            >
                                                Reset Filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page: number) => {
                            setCurrentPage(page);
                            fetchLogs(page);
                        }}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        maxPagesToShow={5}
                    />
                </div>
            </div>

            {/* Modal */}
            <ViewLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};

export default AuditLogsPage;
