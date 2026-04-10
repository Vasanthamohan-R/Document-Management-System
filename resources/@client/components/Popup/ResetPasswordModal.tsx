import React, { useState } from "react";
import { X, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    email: string;
}

interface TokenResponse {
    status: string;
    code: number;
    message: string;
    data: {
        token: string;
        expires_in: number;
    };
}

export default function ResetPasswordModal({
    isOpen,
    onClose,
    onSuccess,
    email,
}: ResetPasswordModalProps) {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const ensureValidToken = async (): Promise<boolean> => {
        const token = localStorage.getItem("client_token");
        const expiry = localStorage.getItem("token_expiry");

        if (!token || !expiry) {
            try {
                const response = await axios.post<TokenResponse>(
                    `${import.meta.env.VITE_API_URL}/client/token/generate`,
                    { client_id: import.meta.env.VITE_CLIENT_ID },
                );
                const { token: newToken, expires_in } = response.data.data;
                localStorage.setItem("client_token", newToken);
                localStorage.setItem("token_expiry", expires_in.toString());
                return true;
            } catch (error) {
                console.error("Failed to generate token:", error);
                return false;
            }
        }

        const expiryDate = new Date(expiry);
        const now = new Date();
        const minutesLeft =
            (expiryDate.getTime() - now.getTime()) / (1000 * 60);

        if (minutesLeft < 2) {
            try {
                const response = await axios.post<TokenResponse>(
                    `${import.meta.env.VITE_API_URL}/client/token/generate`,
                    { client_id: import.meta.env.VITE_CLIENT_ID },
                );
                const { token: newToken, expires_in } = response.data.data;
                localStorage.setItem("client_token", newToken);
                localStorage.setItem("token_expiry", expires_in.toString());
                return true;
            } catch (error) {
                console.error("Failed to generate token:", error);
                return false;
            }
        }

        return true;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Password validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
            );
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const tokenValid = await ensureValidToken();
            if (!tokenValid) {
                setError("Unable to authenticate. Please try again.");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("client_token");
            if (!token) {
                setError("Session expired. Please refresh.");
                setLoading(false);
                return;
            }

            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/password/reset`,
                {
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                },
                { headers: { "X-CLIENT-TOKEN": token } },
            );

            setSuccess(true);

            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to reset password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <div className="p-8">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <CheckCircle className="w-12 h-12 text-green-600" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-800">
                                        Password Changed!
                                    </h2>
                                    <p className="text-gray-500 mb-6">
                                        Your password has been successfully
                                        changed.
                                    </p>
                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5 }}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Reset Password
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            Create a new secure password for
                                            your account
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleResetPassword}
                                        className="space-y-4"
                                    >
                                        {error && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                                <AlertCircle size={16} />
                                                {error}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    required
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter your new password"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand focus:outline-none pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    required
                                                    value={passwordConfirmation}
                                                    onChange={(e) =>
                                                        setPasswordConfirmation(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Confirm your new password"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand focus:outline-none pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword,
                                                        )
                                                    }
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full bg-brand text-white py-2 rounded-lg hover:bg-brand-dark transition font-semibold ${
                                                loading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {loading
                                                ? "Resetting..."
                                                : "Reset Password"}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
