import React from "react";
import {
    Search,
    Bell,
    Plus,
    Moon,
    Sun,
    Menu,
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import Button from "@/components/ui/Button";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
 import { logout } from "@/stores/slices/authSlice"
// import { clearAuth } from "@/stores/authSlice";

interface HeaderProps {
    setIsMobileOpen: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsMobileOpen }) => {

    const { isDarkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = useAppSelector((state) => state.auth.user);
    const userName = user?.name || "User";
    const userEmail = user?.email || "user@example.com";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMyProfile = () => {
        setIsProfileOpen(false);
        navigate("/profile");
    };

  const handleLogout = async () => {
      setIsProfileOpen(false);
      await dispatch(logout()); 
      navigate("/"); 
  };

    return (
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-white/80 backdrop-blur px-6">
            {/* Left */}
            <div className="flex items-center gap-4">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"
                >
                    <Menu size={20} />
                </motion.button>

                <div className="hidden lg:flex items-center relative">
                    <Search
                        size={16}
                        className="absolute left-3 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-10 w-80 pl-9 border rounded-lg text-sm"
                    />
                </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

                <Button icon={Plus} size="sm">
                    Add
                </Button>

                <button
                    onClick={toggleDarkMode}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="relative">
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <Bell size={18} />
                    </button>
                    <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-blue-600" />
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200 transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white font-semibold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown size={16} className="text-slate-500" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {userName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {userEmail}
                                </p>
                            </div>
                            <div className="py-2">
                                <button
                                    onClick={handleMyProfile}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <User size={16} />
                                    My Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
