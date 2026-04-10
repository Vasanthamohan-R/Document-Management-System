import React, { useState, useEffect } from "react";
import {
    X,
    ArrowLeft,
    Mail,
    Clock,
    AlertCircle,
    CheckCircle,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import auth from "@/services/AuthService";
import { Alert } from "@/utils/Alert/Alert";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type Step = "email" | "otp" | "reset";

interface ErrorType {
    message: string;
    remainingAttempts?: number;
    maxAttempts?: number;
    isLocked?: boolean;
    hoursRemaining?: number;
}

export default function ForgotPasswordModal({
    isOpen,
    onClose,
    onSuccess,
}: ForgotPasswordModalProps) {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorType | null>(null);
    const [resendCooldown, setResendCooldown] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Load OTP expiry from localStorage when modal opens to step otp
    useEffect(() => {
        if (isOpen && step === "otp") {
            const expiryTimestamp = localStorage.getItem("reset_otp_expiry_at");
            if (expiryTimestamp) {
                const expiry = parseInt(expiryTimestamp);
                setOtpExpiry(expiry);
            } else {
                setOtpExpiry(null);
            }
        }
    }, [isOpen, step]);

    // Timer for OTP expiry
    useEffect(() => {
        if (!isOpen || step !== "otp" || !otpExpiry) {
            setTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = otpExpiry - now;

            if (remaining <= 0) {
                setTimeRemaining(0);
            } else {
                setTimeRemaining(remaining);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [isOpen, step, otpExpiry]);

    // Format time for display
    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return "Expired";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // Check if OTP is expired
    const isOtpExpired = (): boolean => {
        if (!otpExpiry) return false;
        const now = Math.floor(Date.now() / 1000);
        return now >= otpExpiry;
    };

    // Determine if resend button should be disabled
    const isResendDisabled = (): boolean => {
        return resendCooldown || loading;
    };

    // Get resend button text based on state
    const getResendButtonText = () => {
        if (resendCooldown) {
            return `Resend in ${countdown}s`;
        }
        return "Resend Code";
    };

    // Step 1: Request OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await auth.post("/auth/password/request", {
                email,
            });

            if (response.data?.expires_at) {
                const newExpiry = parseInt(response.data.expires_at);
                localStorage.setItem("reset_otp_expiry_at", String(newExpiry));
                setOtpExpiry(newExpiry);
                const now = Math.floor(Date.now() / 1000);
                const remaining = newExpiry - now;
                setTimeRemaining(remaining > 0 ? remaining : 0);
            }

            setStep("otp");
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError({ message: err.response.data.message });
            } else {
                setError({ message: "Failed to send OTP. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            setError({ message: "Please enter the complete 6-digit code" });
            return;
        }

        if (isOtpExpired()) {
            setError({
                message: "OTP has expired. Please request a new code.",
            });
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await auth.post("/auth/verify-otp", {
                identifier: email,
                otp: otp,
                purpose: "password_reset",
            });

            localStorage.removeItem("reset_otp_expiry_at");
            setOtpExpiry(null);
            setTimeRemaining(0);
            setStep("reset");
        } catch (err: any) {
            const responseData = err.response?.data;

            // Check if this is a wrong OTP attempt with remaining attempts
            if (responseData?.remaining_attempts !== undefined) {
                setError({
                    message: responseData.message,
                    remainingAttempts: responseData.remaining_attempts,
                    maxAttempts: responseData.max_attempts,
                    isLocked: false,
                });
            }
            // Check if account is locked
            else if (responseData?.hours_remaining !== undefined) {
                setError({
                    message: responseData.message,
                    isLocked: true,
                    hoursRemaining: responseData.hours_remaining,
                });
            } else if (responseData?.locked_for_hours !== undefined) {
                setError({
                    message: responseData.message,
                    isLocked: true,
                    hoursRemaining: responseData.locked_for_hours,
                });
            } else {
                setError({
                    message:
                        responseData?.message ||
                        "Invalid OTP. Please try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError(null);
        setResendCooldown(true);
        setCountdown(30);
        setOtp("");

        const cooldownTimer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownTimer);
                    setResendCooldown(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        try {
            const response = await auth.post("/auth/resend-otp", {
                identifier: email,
                purpose: "password_reset",
            });

            if (response.data?.expires_at) {
                const newExpiry = parseInt(response.data.expires_at);
                localStorage.setItem("reset_otp_expiry_at", String(newExpiry));
                setOtpExpiry(newExpiry);
                const now = Math.floor(Date.now() / 1000);
                const remaining = newExpiry - now;
                setTimeRemaining(remaining > 0 ? remaining : 0);
            }
        } catch (err: any) {
            if (err.response?.status === 429) {
                setError({ message: err.response.data.message });
            } else {
                setError({
                    message: "Failed to resend OTP. Please try again.",
                });
            }
            setResendCooldown(false);
            clearInterval(cooldownTimer);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            setError({ message: "Password must be at least 8 characters" });
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError({
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
            });
            return;
        }

        if (password !== passwordConfirmation) {
            setError({ message: "Passwords do not match." });
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await auth.post("/auth/password/reset", {
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            }, 1500);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError({ message: err.response.data.message });
            } else {
                setError({
                    message: "Failed to reset password. Please try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep("email");
        setEmail("");
        setOtp("");
        setPassword("");
        setPasswordConfirmation("");
        setError(null);
        setResendCooldown(false);
        setCountdown(30);
        setTimeRemaining(0);
        setOtpExpiry(null);
        setSuccess(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        localStorage.removeItem("reset_otp_expiry_at");
        onClose();
    };

    const goBack = () => {
        if (step === "otp") {
            setStep("email");
            setError(null);
            localStorage.removeItem("reset_otp_expiry_at");
            setOtpExpiry(null);
            setTimeRemaining(0);
        }
    };

    // Reset form state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep("email");
            setEmail("");
            setOtp("");
            setPassword("");
            setPasswordConfirmation("");
            setError(null);
            setResendCooldown(false);
            setCountdown(30);
            setTimeRemaining(0);
            setOtpExpiry(null);
            setSuccess(false);
            setShowPassword(false);
            setShowConfirmPassword(false);
            localStorage.removeItem("reset_otp_expiry_at");
        }
    }, [isOpen]);

    const renderStep = () => {
        if (success) {
            return (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">
                        Password Reset Successfully!
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Your password has been reset. You can now log in with
                        your new password.
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
            );
        }

        switch (step) {
            case "email":
                return (
                    <motion.div
                        key="email"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-4"
                    >
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Forgot Password?
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Enter your email to receive a password reset OTP
                            </p>
                        </div>
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1 text-sm">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand focus:outline-none transition"
                                />
                            </div>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle size={16} />
                                    {error.message}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-brand text-white py-2 rounded-lg hover:bg-brand-dark transition font-semibold ${
                                    loading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Remember your password?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClose();
                                        if (onSuccess) onSuccess();
                                    }}
                                    className="text-brand hover:underline font-medium"
                                >
                                    Log In
                                </button>
                            </p>
                        </form>
                    </motion.div>
                );

            case "otp":
                return (
                    <motion.div
                        key="otp"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-4"
                    >
                        <button
                            onClick={goBack}
                            className="flex items-center text-gray-500 hover:text-brand transition text-sm mb-2"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </button>

                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Verify OTP
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Enter the 6-digit code sent to{" "}
                                <span className="font-semibold text-gray-700">
                                    {email}
                                </span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            {timeRemaining > 0 && (
                                <div className="mb-4 flex items-center justify-center gap-2">
                                    <Clock
                                        size={16}
                                        className="text-gray-500"
                                    />
                                    <span className="text-gray-600 text-sm font-medium">
                                        Code expires in:{" "}
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                            )}

                            {error && (
                                <div
                                    className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                                        error.isLocked
                                            ? "bg-orange-50 border border-orange-200 text-orange-700"
                                            : error.remainingAttempts !==
                                                    undefined &&
                                                error.remainingAttempts <= 2
                                              ? "bg-red-50 border border-red-200 text-red-600"
                                              : "bg-red-50 border border-red-200 text-red-600"
                                    }`}
                                >
                                    <AlertCircle
                                        size={16}
                                        className="flex-shrink-0 mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <p>{error.message}</p>
                                        {error.remainingAttempts !==
                                            undefined && (
                                            <p className="text-xs mt-1 font-medium">
                                                ⚠️ {error.remainingAttempts} out
                                                of {error.maxAttempts} attempts
                                                remaining
                                            </p>
                                        )}
                                        {error.hoursRemaining !== undefined && (
                                            <p className="text-xs mt-1 font-medium">
                                                🔒 Try again in{" "}
                                                {error.hoursRemaining}{" "}
                                                {error.hoursRemaining === 1
                                                    ? "hour"
                                                    : "hours"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700 mb-1 text-sm">
                                    OTP Code
                                </label>
                                <div className="flex justify-between gap-2">
                                    {[...Array(6)].map((_, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength={1}
                                            value={otp[index] || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (
                                                    value &&
                                                    !/^\d+$/.test(value)
                                                )
                                                    return;
                                                const newOtp = otp.split("");
                                                if (value) {
                                                    newOtp[index] = value;
                                                    setOtp(newOtp.join(""));
                                                    if (index < 5) {
                                                        const nextInput =
                                                            document.getElementById(
                                                                `otp-${index + 1}`,
                                                            );
                                                        nextInput?.focus();
                                                    }
                                                } else {
                                                    newOtp[index] = "";
                                                    setOtp(newOtp.join(""));
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace") {
                                                    if (
                                                        !otp[index] &&
                                                        index > 0
                                                    ) {
                                                        const prevInput =
                                                            document.getElementById(
                                                                `otp-${index - 1}`,
                                                            );
                                                        prevInput?.focus();
                                                        const newOtp =
                                                            otp.split("");
                                                        newOtp[index - 1] = "";
                                                        setOtp(newOtp.join(""));
                                                    } else if (otp[index]) {
                                                        const newOtp =
                                                            otp.split("");
                                                        newOtp[index] = "";
                                                        setOtp(newOtp.join(""));
                                                    }
                                                }
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const pastedData =
                                                    e.clipboardData.getData(
                                                        "text",
                                                    );
                                                const pastedNumbers = pastedData
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6);
                                                if (pastedNumbers) {
                                                    const newOtp = pastedNumbers
                                                        .padEnd(6, "")
                                                        .slice(0, 6);
                                                    setOtp(newOtp);
                                                    const lastIndex = Math.min(
                                                        pastedNumbers.length -
                                                            1,
                                                        5,
                                                    );
                                                    const lastInput =
                                                        document.getElementById(
                                                            `otp-${lastIndex}`,
                                                        );
                                                    lastInput?.focus();
                                                }
                                            }}
                                            disabled={loading}
                                            className={`w-full h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none ${
                                                loading
                                                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                    : error?.remainingAttempts !==
                                                            undefined &&
                                                        error.remainingAttempts <=
                                                            2
                                                      ? "border-red-300 bg-red-50"
                                                      : "border-gray-300"
                                            }`}
                                            id={`otp-${index}`}
                                            autoFocus={index === 0 && !loading}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Resend Button - Only show when OTP is expired */}
                            {isOtpExpired() && (
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isResendDisabled()}
                                        className={`text-sm ${
                                            isResendDisabled()
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-brand hover:underline"
                                        }`}
                                    >
                                        {getResendButtonText()}
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || isOtpExpired()}
                                className={`w-full bg-brand text-white py-2 rounded-lg hover:bg-brand-dark transition font-semibold mt-2 ${
                                    loading || isOtpExpired()
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>
                    </motion.div>
                );

            case "reset":
                return (
                    <motion.div
                        key="reset"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-4"
                    >
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Reset Password
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Create a new secure password for your account
                            </p>
                        </div>
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle size={16} />
                                    {error.message}
                                </div>
                            )}
                            <div>
                                <label className="block text-gray-700 mb-1 text-sm">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand focus:outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
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
                                        placeholder="Confirm your password"
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
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </motion.div>
                );
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        {/* Left Image */}
                        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100">
                            <img
                                src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1010.jpg"
                                alt="Forgot Password"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Right Content Section */}
                        <div className="w-full md:w-1/2 p-8 relative flex flex-col justify-center">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
                            >
                                <X size={24} />
                            </button>

                            <AnimatePresence mode="wait">
                                {renderStep()}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
