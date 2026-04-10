import excel from "@/assets/icons/excel.png";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import {
    Edit2,
    Eye,
    Filter,
    MoreVertical,
    Search,
    Shield,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
    UserX,
} from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
import AddUserModal from "@/components/Popup/AddUserModal";
import EditUserModal from "@/components/Popup/EditUserModal";
import ViewUserModal from "@/components/Popup/ViewUserModal";
import { User } from "@/types/user";
import api from "@/services/ApiService";
import DatePicker from "react-datepicker";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { fetchDepartments } from "@/stores/slices/locationSlice";
import { fetchRoles } from "@/stores/slices/authSlice";
import { Alert } from "@/utils/Alert/Alert";
import Pagination from "@/components/Base/Pagination";

const UserManagement: React.FC = () => {
    // ========== REDUX HOOKS ==========
    //calling departments for filter dropdown
    const dispatch = useAppDispatch();
    const departments = useAppSelector(
        (state) => state.location.allDepartments,
    );
    const loadingDepartments = useAppSelector(
        (state) => state.location.loading.departments,
    );

    //calling roles for filter dropdown
    const roles = useAppSelector((state) => state.auth.roles);
    const loadingRoles = useAppSelector((state) => state.auth.loading.roles);

    // ========== STATE ==========
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState("name");
    const [statusFilter, setStatusFilter] = useState<number>(0);
    const [roleFilter, setRoleFilter] = useState("all");
    const [deptFilter, setDeptFilter] = useState("all");
    //state for date
    const [dateRange, setDateRange] = useState("30d");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [dateRangeError, setDateRangeError] = useState<string>("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    // ========== HELPER FUNCTIONS ==========
    // ✅ STATUS HELPERS - Convert status codes to labels and colors
    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            "1": "Active",
            "2": "Inactive",
            "4": "Active",
        };
        return map[status] || status;
    };

    const getStatusDotColor = (status: string) => {
        const map: Record<string, string> = {
            "1": "bg-emerald-600",
            "2": "bg-slate-400",
            "4": "bg-emerald-600",
        };
        return map[status] || "bg-slate-400";
    };

    const getStatusTextColor = (status: string) => {
        const map: Record<string, string> = {
            "1": "text-emerald-600",
            "2": "text-slate-400",
            "4": "text-emerald-600",
        };
        return map[status] || "text-slate-400";
    };
    // ========== FETCH USERS ==========
    const fetchUsers = async (overrides: Record<string, any> = {}) => {
        setLoading(true);
        try {
            const payload: any = {
                searchTerm: searchTerm,
                searchBy: searchBy,
                status: statusFilter,
                role_id: roleFilter === "all" ? null : Number(roleFilter),
                department_id: deptFilter === "all" ? null : Number(deptFilter),
                dateRange: dateRange,
                page: currentPage,
                perPage: itemsPerPage,
                ...overrides,
            };
            //   Send custom dates if selected
            if (dateRange === "custom" && startDate && endDate) {
                const formatDate = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                };
                payload.startDate = formatDate(startDate);
                payload.endDate = formatDate(endDate);
            }

            // If export is true, use blob response
            const isExport = payload.export === true;

            const response = await api.post(
                "/auth/user-management/list",
                payload,
                isExport ? { responseType: "blob" } : {},
            );
            // If export is true, trigger file download
            if (isExport) {
                const url = window.URL.createObjectURL(
                    new Blob([response.data]),
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "users.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                return;
            }
            setUsers(response.data.data);
            setTotalPages(response.data.pagination.last_page);
            setTotalUsers(response.data.pagination.total);
        } catch (error) {
            console.error("Error fetching users:", error);
            Alert.Error("Failed to fetch users. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    // ========== Delete User ==========

    const handleDeleteUser = async (userId: number) => {
        // Use custom confirmation dialog
        Alert.Confirm(
            "Are you sure you want to delete this user? This action cannot be undone.",
            async () => {
                // Show loading state
                setLoading(true);

                try {
                   const response = await api.post(
                       `/auth/user-management/delete/${userId}`,
                   );

                    if (response.data.status === "success") {
                        Alert.Success("User deleted successfully");

                        // Refresh the user list
                        // If current page has only 1 item and not first page, go to previous page
                        if (users.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                        } else {
                            fetchUsers();
                        }
                    } else {
                        throw new Error(
                            response.data.message || "Failed to delete user",
                        );
                    }
                } catch (error: any) {
                    console.error("Error deleting user:", error);
                    Alert.Error(
                        error.response?.data?.message ||
                            "Failed to delete user. Please try again.",
                    );
                } finally {
                    setLoading(false);
                }
            },
            "Delete User",
        );
    };

    // helper function to calculate max date
    const getMaxEndDate = (startDate: Date | null) => {
        if (!startDate) return new Date();
        const maxDate = new Date(startDate);
        maxDate.setDate(startDate.getDate() + 30);
        return maxDate > new Date() ? new Date() : maxDate;
    };

    // Function to validate date range (max 1 month)
    const validateDateRange = (start: Date | null, end: Date | null) => {
        if (start && end) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const maxDays = 30; // 1 month maximum

            if (diffDays > maxDays) {
                setDateRangeError(
                    `Date range cannot exceed ${maxDays} days. Please select a shorter range.`,
                );
                return false;
            }
        }
        setDateRangeError("");
        return true;
    };

    // Handle date range change with validation
    const handleDateRangeChange = (update: [Date | null, Date | null]) => {
        const [start, end] = update;

        if (start !== startDate) {
            setEndDate(null);
        }

        // Validate before setting state
        if (validateDateRange(start, end)) {
            setStartDate(start);
            setEndDate(end);
        } else {
            Alert.Warning(
                "Date range cannot exceed 30 days. Please select a shorter range.",
            );
        }
    };
    // ========== USE EFFECTS ==========

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    useEffect(() => {
        if (departments.length === 0) {
            dispatch(fetchDepartments());
        }
    }, [dispatch, departments.length]); // Re-fetch when page changes

    // Fetch roles on component mount
    useEffect(() => {
        if (roles.length === 0) {
            dispatch(fetchRoles());
        }
    }, [dispatch, roles.length]);

    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: "",
        searchBy: "name",
        statusFilter: 0,
        roleFilter: "all",
        deptFilter: "all",
        dateRange: "30d",
        startDate: null as Date | null,
        endDate: null as Date | null,
    });

    const handleApplyFilters = () => {
        setAppliedFilters({
            searchTerm,
            searchBy,
            statusFilter,
            roleFilter,
            deptFilter,
            dateRange,
            startDate,
            endDate,
        });
        setCurrentPage(1);
        fetchUsers({ page: 1 });
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSearchBy("name");
        setStatusFilter(0);
        setRoleFilter("all");
        setDeptFilter("all");
        setDateRange("30d");
        setStartDate(null);
        setEndDate(null);
        setCurrentPage(1);

        fetchUsers({
            searchTerm: "",
            searchBy: "name",
            status: 0,
            role_id: null,
            department_id: null,
            dateRange: "30d",
            startDate: undefined,
            endDate: undefined,
            page: 1,
        });
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" size={28} />
                        User Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage system user accounts and access credentials.
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-11 px-6 rounded-2xl shadow-lg shadow-blue-500/20"
                >
                    Create
                </Button>
            </div>

            {/* Unified Table & Filter Card */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden">
                {/* Filter Bar (Integrated) */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2 min-w-[140px]">
                        <Select
                            className="h-10 w-full rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                            options={[
                                { label: "Search By Name", value: "name" },
                                { label: "Search By Email", value: "email" },
                            ]}
                        />
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${searchBy}...`}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleApplyFilters()
                            }
                            className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-3 ml-auto">
                        {/* ✅ STATUS FILTER DROPDOWN */}
                        <Select
                            className="h-10 min-w-[150px] rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(Number(e.target.value));
                            }}
                            options={[
                                { label: "All Status", value: 0 },
                                { label: "Active", value: 1 },
                                { label: "Inactive", value: 2 },
                            ]}
                        />
                        <Select
                            className="h-10 min-w-[150px] rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                            }}
                            options={[
                                { label: "All Roles", value: "all" },
                                ...roles.map((role) => ({
                                    label: role.name,
                                    value: role.id.toString(),
                                })),
                            ]}
                            disabled={loadingRoles}
                        />

                        <Select
                            className="h-10 min-w-[160px] rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                            value={deptFilter}
                            onChange={(e) => {
                                setDeptFilter(e.target.value);
                            }}
                            options={[
                                { label: "All Depts", value: "all" },
                                ...departments.map((dept) => ({
                                    label: dept.name,
                                    value: dept.id.toString(),
                                })),
                            ]}
                            disabled={loadingDepartments}
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
                                { label: "Custom Range", value: "custom" },
                            ]}
                        />

                        {dateRange === "custom" && (
                            <div className="flex items-center gap-2">
                                <DatePicker
                                    selectsRange={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateRangeChange}
                                    placeholderText="Select date range"
                                    className="h-10 w-56 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                                    dateFormat="dd-MM-yyyy"
                                    isClearable={true}
                                    monthsShown={2}
                                    popperPlacement="bottom-start"
                                    calendarStartDay={1}
                                    minDate={startDate || undefined}
                                    maxDate={getMaxEndDate(startDate)}
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

                        <button
                            onClick={() => {
                                fetchUsers({
                                    export: true,
                                    page: 1,
                                    perPage: 10000,
                                });
                            }}
                            className="h-10 pl-3 pr-4 flex items-center gap-1 transition-all font-bold text-[13px] tracking-wide cursor-pointer"
                            title="Export to Excel"
                        >
                            <img
                                src={excel}
                                alt="Excel"
                                className="h-4 w-4 block object-contain"
                            />
                            <span className="text-green-600">EXCEL</span>
                        </button>
                    </div>
                </div>

                {/* Users Table Area */}
                <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar m-5">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
                        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                            <tr className="">
                                <th className="px-6 py-3 text-[11px] uppercase tracking-widest font-bold w-[60px]">
                                    No.
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[150px]">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[200px]">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[100px]">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[140px]">
                                    Department
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[100px]">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[130px]">
                                    Created At
                                </th>
                                <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-bold w-[130px]">
                                    Last Active
                                </th>
                                <th className="px-6 py-3 text-[11px] uppercase tracking-widest font-bold w-[100px] text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all duration-300"
                                    >
                                        <td className="px-6 py-2 text-sm text-slate-400">
                                            {(currentPage - 1) * itemsPerPage +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-4 py-2">
                                            <h3
                                                className="text-sm text-slate-900 dark:text-white truncate max-w-[140px] leading-tight font-medium"
                                                title={user.name}
                                            >
                                                {user.name}
                                            </h3>
                                        </td>
                                        <td className="px-4 py-2">
                                            <p
                                                className="text-sm text-slate-500 truncate max-w-[190px]"
                                                title={user.email}
                                            >
                                                {user.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-2">
                                            <p
                                                className="text-sm text-slate-400 uppercase tracking-wider leading-none text-[10px] font-bold truncate max-w-[90px]"
                                                title={user.role_name || "N/A"}
                                            >
                                                {user.role_name || "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-2">
                                            <p
                                                className="text-sm text-slate-400 uppercase tracking-wider leading-none text-[10px] font-bold truncate max-w-[130px]"
                                                title={
                                                    user.department_name ||
                                                    "N/A"
                                                }
                                            >
                                                {user.department_name || "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 text-[12px] font-bold leading-none",
                                                    getStatusTextColor(
                                                        user.status,
                                                    ),
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        getStatusDotColor(
                                                            user.status,
                                                        ),
                                                    )}
                                                ></span>
                                                <span className="capitalize">
                                                    {getStatusLabel(
                                                        user.status,
                                                    )}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <p
                                                className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px]"
                                                title={user.created_at}
                                            >
                                                {user.created_at}
                                            </p>
                                        </td>
                                        <td className="px-4 py-2">
                                            <p
                                                className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px]"
                                                title={user.updated_at}
                                            >
                                                {user.updated_at}
                                            </p>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsViewModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                                    title="View User"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id,
                                                        )
                                                    }
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
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
                                                No users found matching your
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
                {/* Pagination Footer (Integrated) */}
                <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page: number) => {
                            setCurrentPage(page);
                            fetchUsers({ page });
                        }}
                        totalItems={totalUsers}
                        itemsPerPage={itemsPerPage}
                        maxPagesToShow={5}
                    />
                </div>
            </div>

            {/* Modals */}
            <AddUserModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchUsers();
                    setCurrentPage(1);
                }}
            />

            <EditUserModal
                open={isEditModalOpen}
                user={selectedUser}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                    fetchUsers();
                    setSelectedUser(null);
                }}
            />

            <ViewUserModal
                open={isViewModalOpen}
                user={selectedUser}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
};

export default UserManagement;
