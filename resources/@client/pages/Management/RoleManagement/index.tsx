import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    X,
    Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import api from "@/services/ApiService";
import { Alert } from "@/utils/Alert/Alert";
import Pagination from "@/components/Base/Pagination";


interface Role {
    id: number;
    name: string;
    description: string;
    users: number;
    status: "Active" | "Inactive";
    formatted_date: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    department_id: number;
    department_name: string;
}

const RoleManagement: React.FC = () => {
    const navigate = useNavigate();

    // States
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState("name");
    const [inputSearchTerm, setInputSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // User popup states
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch roles
    const fetchRoles = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);

                const res = await api.post("/auth/role-list", {
                    page,
                    search: searchTerm,
                    searchBy: searchBy,
                    status: statusFilter,
                });

                if (res.data.status === "success") {
                    const rolesArray: any[] = Array.isArray(res.data.data) ? res.data.data : [];
                    const mapped = rolesArray.map((r: any) => {
                        const usersCount = Number(r.users_count ?? 0);
                        return {
                            id: r.id,
                            name: r.name,
                            description: r.description,
                            status: r.status === "1" ? "Active" : "Inactive",
                            formatted_date: r.created_at,
                            users: usersCount,
                            deletable: usersCount === 0,
                        };
                    });

                    setRoles(mapped);
                    setTotalPages(res.data.last_page ?? 1);
                    setTotalItems(res.data.total ?? 0);
                } else {
                    Alert.Error(res.data.message);
                }
            } catch (err) {
                console.error(err);
                Alert.Error("Something went wrong");
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, searchBy, statusFilter],
    );

    // Fetch users for a role
    const handleUserClick = async (role: Role) => {
        setSelectedRole(role);
        setShowUserModal(true);
        setLoadingUsers(true);

        try {
            // Fetch ALL users
            const response = await api.post("/auth/user-list", {
                page: 1,
                per_page: 10000, // Get all users at once
            });

            if (response.data && response.data.data) {
                // Filter users by role_id in frontend
                const filteredUsers = response.data.data.filter(
                    (user: any) => user.role_id === role.id,
                );

                const mappedUsers = filteredUsers.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    department_id: user.department_id,
                    department_name: user.department_name || "N/A",
                }));

                setUsers(mappedUsers);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            Alert.Error("Failed to fetch users");
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleApplyFilters = () => {
        setSearchTerm(inputSearchTerm);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setInputSearchTerm("");
        setSearchTerm("");
        setSearchBy("name");
        setStatusFilter("all");
        setCurrentPage(1);
    };

    const handleDelete = async (id: number) => {
        const role = roles.find((r) => r.id === id);

        if (role && role.users > 0) {
            Alert.Warning(
                `This role has ${role.users} user(s) assigned. Cannot delete.`,
            );
        } else {
            Alert.Confirm("Delete this role?", async () => {
                try {
                    const res = await api.post("/auth/role-delete", { id });
                    if (res.data.status) {
                        Alert.Success("Role deleted successfully");
                        fetchRoles(currentPage);
                    } else {
                        Alert.Error(res.data.message);
                    }
                } catch (err) {
                    console.error(err);
                    Alert.Error("Delete failed");
                }
            });
        }
    };
    
   const handleDeleteUser = async (userId: number) => {
       // Use custom confirmation dialog
       Alert.Confirm(
           "Are you sure you want to delete this user? This action cannot be undone.",
           async () => {
               // Show loading state
               setLoading(true);

               try {
                   const response = await api.post(
                       "/auth/user-delete",
                       { id: userId },
                   );

                   if (response.data.status === "success") {
                       Alert.Success("User deleted successfully");

                       // Refresh the user list
                       // If current page has only 1 item and not first page, go to previous page
                       if (users.length === 1 && currentPage > 1) {
                           setCurrentPage(currentPage - 1);
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

    useEffect(() => {
        fetchRoles(currentPage);
    }, [currentPage, fetchRoles]);

    return (
        <div className="flex flex-col h-full gap-6 relative">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" size={28} />
                        Role Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Define and manage system roles and their associated
                        permissions.
                    </p>
                </div>

                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => navigate("/role/create")}
                    className="h-11 px-6 rounded-2xl shadow-lg shadow-blue-500/20"
                >
                    Create
                </Button>
            </div>

            {/* Unified Table & Filter Card */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-md border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden transition-colors duration-300">
                {/* Filter Bar */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2 min-w-[140px]">
                        <Select
                            className="h-10 w-full rounded-md bg-white border border-slate-200 text-xs font-medium"
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                            options={[
                                { label: "Search By Name", value: "name" },
                            ]}
                        />
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${searchBy}...`}
                            value={inputSearchTerm}
                            onChange={(e) => setInputSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleApplyFilters()
                            }
                            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <Select
                            className="h-10 min-w-[150px] rounded-md bg-white border border-slate-200 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { label: "All Status", value: "all" },
                                { label: "Active", value: "Active" },
                                { label: "Inactive", value: "Inactive" },
                            ]}
                        />

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

                {/* Table Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar m-5">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors uppercase tracking-widest font-bold text-[11px] text-slate-500 dark:text-slate-200">
                            <tr>
                                <th className="w-1/7 px-6 py-4 border-none first:rounded-tl-md">
                                    No.
                                </th>
                                <th className="w-1/7 px-4 py-4 border-none">
                                    Role Name
                                </th>
                                <th className="w-1/7 px-4 py-4 border-none">
                                    Description
                                </th>
                                <th className="w-1/7 px-4 py-4 border-none text-center">
                                    Users
                                </th>
                                <th className="w-1/7 px-4 py-4 border-none">
                                    Status
                                </th>
                                <th className="w-1/7 px-4 py-4 border-none">
                                    Created At
                                </th>
                                <th className="w-1/7 px-6 py-4 border-none text-right last:rounded-tr-md">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-pulse p-4 rounded-full bg-slate-50">
                                                <ShieldCheck className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-medium">
                                                Loading roles...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : roles.length > 0 ? (
                                roles.map((role, index) => (
                                    <tr
                                        key={role.id}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-all duration-300"
                                    >
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {(currentPage - 1) * itemsPerPage +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-200">
                                            {role.name}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                            {role.description}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span
                                                onClick={() =>
                                                    handleUserClick(role)
                                                }
                                                className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                                            >
                                                <Users size={10} />
                                                {role.users} Users
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 text-[12px] font-bold leading-none",
                                                    role.status === "Active"
                                                        ? "text-emerald-600"
                                                        : "text-slate-400",
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        role.status === "Active"
                                                            ? "bg-emerald-600"
                                                            : "bg-slate-400",
                                                    )}
                                                ></span>
                                                {role.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {role.formatted_date}
                                        </td>
                                        <td className="px-6 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/role/edit/${role.id}`)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Role"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(role.id)
                                                    }
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title={
                                                        role.users > 0
                                                            ? `${role.users} user(s) assigned`
                                                            : "Delete Role"
                                                    }
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
                                        colSpan={7}
                                        className="px-4 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <Filter className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                                No roles found matching your filters.
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

               
                {/* Pagination Footer */}
                <div className="px-8 py-4 border-t border-slate-100">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page: number) => setCurrentPage(page)}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        maxPagesToShow={5}
                    />
                </div>
            </div>

            {/* User Popup Modal */}
            {showUserModal && selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowUserModal(false)}
                    />

                    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
                        <button
                            onClick={() => setShowUserModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Users with Role: {selectedRole.name}
                            </h2>
                            {!loadingUsers && users.length > 0 && (
                                <span className="ml-2 px-2 py-1 text-xs bg-slate-100 rounded-full">
                                    Total: {users.length}
                                </span>
                            )}
                        </div>

                        <div className="mt-4">
                            {loadingUsers ? (
                                <div className="text-center py-12">
                                    <div className="animate-pulse">
                                        <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-400">
                                            Loading users...
                                        </p>
                                    </div>
                                </div>
                            ) : users.length > 0 ? (
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-white">
                                            <tr className="border-b border-slate-200">
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                                                    ID
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Dept ID
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                                                    Department
                                                </th>
                                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="hover:bg-slate-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-sm text-slate-600">
                                                        {user.id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                                        {user.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">
                                                        {user.department_id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">
                                                        {user.department_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500 text-center">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    user.id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="p-4 rounded-full bg-slate-50 inline-flex mb-3">
                                        <Users className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-medium">
                                        No users assigned to this role yet
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowUserModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default RoleManagement;
