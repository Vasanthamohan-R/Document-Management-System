import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "@/stores/hooks";
import {
    fetchCountries,
    fetchStates,
    fetchCities,
    fetchDepartments,
} from "@/stores/slices/locationSlice";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/DocumentManagement/Dashboard";
import Documents from "@/pages/DocumentManagement/Documents";
import UploadDocument from "@/pages/DocumentManagement/UploadDocument";
import Approvals from "@/pages/DocumentManagement/Approvals";
 import AuditLogs from "@/pages/Logs/AuditLogs";
import ContactLogs from "@/pages/Logs/ContactLogs";
import Archive from "@/pages/DocumentManagement/Archive";
import Folders from "@/pages/DocumentManagement/Folders";
import UserManagement from "@/pages/Management/UserManagement";
import RoleManagement from "@/pages/Management/RoleManagement";
import RoleForm from "@/components/RoleForm";
import ChangePassword from "@/pages/Profile/ChangePassword";


// Auth Pages

import LandingPage from "@/pages/LandingPage";
import { fetchUserProfile } from "@/stores/slices/authSlice";
import UserProfile from "@/pages/Profile/UserProfile";

const App = () => {
    const dispatch = useAppDispatch();
    // After login or when token exists
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch]);
    // Load location data once when app starts
    useEffect(() => {
        dispatch(fetchCountries());
        dispatch(fetchStates());
        dispatch(fetchCities());
        dispatch(fetchDepartments());
    }, [dispatch]);
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}

            {/* Admin Dashboard Routes (Protected in real scenario) */}
            <Route path="/" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="documents" element={<Documents />} />
                <Route path="upload" element={<UploadDocument />} />
                <Route path="approvals" element={<Approvals />} />
                <Route path="role" element={<RoleManagement />} />
                <Route path="role/create" element={<RoleForm />} />
                <Route path="role/edit/:id" element={<RoleForm />} />
                <Route path="archive" element={<Archive />} />
                <Route path="users" element={<UserManagement />} />

                {/* Fallback for other routes mentioned in sidebar */}
                <Route path="categories" element={<Folders />} />
                <Route path="versions" element={<Documents />} />
                <Route path="settings" element={<Dashboard />} />
                <Route path="logs/audit" element={<AuditLogs />} />
                 <Route path="logs/contact" element={<ContactLogs />} /> 

                <Route path="/profile" element={<UserProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;