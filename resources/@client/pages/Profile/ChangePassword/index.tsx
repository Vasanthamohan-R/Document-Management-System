// pages/ChangePassword.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/ApiService";
import {
    Eye,
    EyeOff,
    Lock,
    CheckCircle,
    XCircle,
    ArrowLeft,
} from "lucide-react";
import { Alert } from "@/utils/Alert/Alert";

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Password strength calculation
    const getPasswordStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        if (score <= 2)
            return {
                text: "Weak",
                color: "text-red-500",
                bg: "bg-red-500",
                width: "20%",
            };
        if (score <= 3)
            return {
                text: "Fair",
                color: "text-yellow-500",
                bg: "bg-yellow-500",
                width: "40%",
            };
        if (score <= 4)
            return {
                text: "Good",
                color: "text-blue-500",
                bg: "bg-blue-500",
                width: "70%",
            };
        return {
            text: "Strong",
            color: "text-green-500",
            bg: "bg-green-500",
            width: "100%",
        };
    };

    const passwordStrength = getPasswordStrength(formData.new_password);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.current_password) {
            newErrors.current_password = "Current password is required";
        }
        if (!formData.new_password) {
            newErrors.new_password = "New password is required";
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = "Password must be at least 8 characters";
        }
        if (formData.new_password !== formData.new_password_confirmation) {
            newErrors.new_password_confirmation = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await api.post("/auth/change/password", {
                current_password: formData.current_password,
                password: formData.new_password,
                password_confirmation: formData.new_password_confirmation,
            });

            if (response.data.status === "success") {
                Alert.Success("Password changed successfully!");
                navigate("/profile");
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Alert.Error(
                    error.response?.data?.message ||
                        "Failed to change password",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePassword = (field: "current" | "new" | "confirm") => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Simple Navigation */}
            <div className="border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group"
                    >
                        <ArrowLeft
                            size={18}
                            className="group-hover:-translate-x-0.5 transition-transform"
                        />
                        <span>Back to Profile</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Change Password
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Choose a strong password that you don't use elsewhere
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showPasswords.current
                                            ? "text"
                                            : "password"
                                    }
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                        errors.current_password &&
                                        touched.current_password
                                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword("current")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.current_password &&
                                touched.current_password && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <XCircle size={12} />{" "}
                                        {errors.current_password}
                                    </p>
                                )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showPasswords.new ? "text" : "password"
                                    }
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                        errors.new_password &&
                                        touched.new_password
                                            ? "border-red-300 focus:ring-red-500"
                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword("new")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.new_password && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                            Password strength
                                        </span>
                                        <span
                                            className={passwordStrength.color}
                                        >
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${passwordStrength.bg} transition-all duration-300 rounded-full`}
                                            style={{
                                                width: passwordStrength.width,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {errors.new_password && touched.new_password && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <XCircle size={12} /> {errors.new_password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showPasswords.confirm
                                            ? "text"
                                            : "password"
                                    }
                                    name="new_password_confirmation"
                                    value={formData.new_password_confirmation}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                        errors.new_password_confirmation &&
                                        touched.new_password_confirmation
                                            ? "border-red-300 focus:ring-red-500"
                                            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword("confirm")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {formData.new_password &&
                                formData.new_password_confirmation &&
                                !errors.new_password_confirmation && (
                                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                                        <CheckCircle size={12} /> Passwords
                                        match
                                    </p>
                                )}
                            {errors.new_password_confirmation &&
                                touched.new_password_confirmation && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <XCircle size={12} />{" "}
                                        {errors.new_password_confirmation}
                                    </p>
                                )}
                        </div>

                        {/* Password Requirements Box */}
                        <div className="bg-gray-50 rounded-xl p-4 mt-4">
                            <p className="text-xs font-semibold text-gray-700 mb-3">
                                Password requirements:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    {formData.new_password.length >= 8 ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>
                                    )}
                                    <span
                                        className={
                                            formData.new_password.length >= 8
                                                ? "text-gray-700"
                                                : "text-gray-500"
                                        }
                                    >
                                        Min. 8 characters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/[A-Z]/.test(formData.new_password) ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>
                                    )}
                                    <span
                                        className={
                                            /[A-Z]/.test(formData.new_password)
                                                ? "text-gray-700"
                                                : "text-gray-500"
                                        }
                                    >
                                        Uppercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/[a-z]/.test(formData.new_password) ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>
                                    )}
                                    <span
                                        className={
                                            /[a-z]/.test(formData.new_password)
                                                ? "text-gray-700"
                                                : "text-gray-500"
                                        }
                                    >
                                        Lowercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/\d/.test(formData.new_password) ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>
                                    )}
                                    <span
                                        className={
                                            /\d/.test(formData.new_password)
                                                ? "text-gray-700"
                                                : "text-gray-500"
                                        }
                                    >
                                        Number
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    {/[@$!%*?&]/.test(formData.new_password) ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>
                                    )}
                                    <span
                                        className={
                                            /[@$!%*?&]/.test(
                                                formData.new_password,
                                            )
                                                ? "text-gray-700"
                                                : "text-gray-500"
                                        }
                                    >
                                        Special character (@$!%*?&)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Updating...
                                    </span>
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Note */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        This password will be used for all your account
                        activities
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
