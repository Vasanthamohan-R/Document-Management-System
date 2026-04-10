import React, { useState, useEffect } from "react";
import { X, Mail, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import auth from "@/services/AuthService";
import { Alert } from "@/utils/Alert/Alert";

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerified?: () => void;
}

interface ResendOtpResponse {
    status: string;
    code: number;
    message: string;
    expires_at: number;
}

interface ErrorType {
    message: string;
    remainingAttempts?: number;
    maxAttempts?: number;
    isLocked?: boolean;
    hoursRemaining?: number;
}

export default function EmailVerificationModal({
    isOpen,
    onClose,
    email,
    onVerified,
}: EmailVerificationModalProps) {
    const [verificationCode, setVerificationCode] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
    const [error, setError] = useState<ErrorType | null>(null);

    // Timer for OTP expiry
    useEffect(() => {
        if (!isOpen || !otpExpiry) {
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
    }, [isOpen, otpExpiry]);

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
        return resendCooldown || isLoading;
    };

    // Inputs should be disabled only during loading
    const shouldDisableInputs = (): boolean => {
        return isLoading;
    };

    // Load OTP expiry from localStorage
    useEffect(() => {
        if (isOpen) {
            const expiryTimestamp = localStorage.getItem("otp_expiry_at");
            if (expiryTimestamp) {
                const expiryMs = parseInt(expiryTimestamp);
                const expirySeconds = Math.floor(expiryMs / 1000);
                setOtpExpiry(expirySeconds);
            } else {
                setOtpExpiry(null);
            }
        }
    }, [isOpen]);

    // Reset all states when modal opens
    useEffect(() => {
        if (isOpen) {
            setVerificationCode(["", "", "", "", "", ""]);
            setError(null);
            setSuccess(false);
            setIsLoading(false);
            setResendCooldown(false);
            setCountdown(30);
            const expiryTimestamp = localStorage.getItem("otp_expiry_at");
            if (expiryTimestamp) {
                const expiryMs = parseInt(expiryTimestamp);
                const expirySeconds = Math.floor(expiryMs / 1000);
                setOtpExpiry(expirySeconds);
            } else {
                setOtpExpiry(null);
            }
            setTimeout(() => {
                const firstInput = document.getElementById("code-0");
                firstInput?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handlePaste = (e: React.ClipboardEvent) => {
        if (shouldDisableInputs()) return;
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim();
        if (!/^\d{6}$/.test(pasteData)) return;
        const newCode = pasteData.split("");
        setVerificationCode(newCode);
        const lastInput = document.getElementById("code-5");
        lastInput?.focus();
    };

    const handleCodeChange = (index: number, value: string) => {
        if (shouldDisableInputs()) return;
        if (value.length > 1) return;
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (shouldDisableInputs()) return;
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async () => {
        const code = verificationCode.join("");
        if (code.length !== 6) {
            setError({ message: "Please enter the complete 6-digit code" });
            return;
        }

        if (isOtpExpired()) {
            setError({
                message: "OTP has expired. Please request a new code.",
            });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await auth.post("/auth/verify-otp", {
                identifier: email,
                otp: code,
                purpose: "registration",
            });

            setSuccess(true);
            localStorage.removeItem("otp_expiry_at");
            localStorage.removeItem("user_email");
            setOtpExpiry(null);

            if (onVerified) {
                setTimeout(() => {
                    onVerified();
                    onClose();
                }, 1500);
            }
        } catch (error: any) {
            const responseData = error.response?.data;

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
                        responseData?.message || "Invalid verification code",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError(null);
        setResendCooldown(true);
        setCountdown(30);
        setVerificationCode(["", "", "", "", "", ""]);

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
            const response = await auth.post<ResendOtpResponse>(
                "/auth/resend-otp",
                {
                    identifier: email,
                    purpose: "registration",
                },
            );

            if (response.data?.expires_at) {
                const newExpirySeconds = response.data.expires_at;
                const newExpiryMs = newExpirySeconds * 1000;

                localStorage.setItem("otp_expiry_at", newExpiryMs.toString());
                setOtpExpiry(newExpirySeconds);
                const now = Math.floor(Date.now() / 1000);
                const timeLeft = newExpirySeconds - now;
                setTimeRemaining(timeLeft > 0 ? timeLeft : 0);
            } else {
                console.error(
                    "No expiry time received from API",
                    response.data,
                );
                setError({
                    message: "Failed to get expiry time. Please try again.",
                });
                setResendCooldown(false);
                clearInterval(cooldownTimer);
            }

            setTimeout(() => {
                const firstInput = document.getElementById("code-0");
                firstInput?.focus();
            }, 100);
        } catch (error: any) {
            console.error("Resend OTP error:", error);
            setError({
                message:
                    error.response?.data?.message ||
                    "Failed to resend code. Please try again.",
            });
            setResendCooldown(false);
            clearInterval(cooldownTimer);
        }
    };

    const getResendButtonText = () => {
        if (resendCooldown) {
            return `Resend in ${countdown}s`;
        }
        return "Resend Code";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Image */}
                        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-brand/5 to-brand/10">
                            <img
                                src="https://img.freepik.com/free-vector/email-verification-concept-illustration_114360-1157.jpg"
                                alt="Email Verification"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://cdni.iconscout.com/illustration/premium/thumb/email-verification-illustration-download-in-svg-png-gif-file-formats--unsubscribe-security-pack-illustrations-3422213.png";
                                }}
                            />
                        </div>

                        {/* Right Content Section */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>

                            {!success ? (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-brand/10 p-3 rounded-full">
                                            <Mail className="w-8 h-8 text-brand" />
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                                        Verify Your Email
                                    </h2>

                                    <p className="text-gray-500 text-center text-sm mb-6">
                                        We've sent a 6-digit verification code
                                        to
                                        <br />
                                        <span className="font-medium text-gray-700">
                                            {email}
                                        </span>
                                    </p>

                                    {/* Timer Display */}
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

                                    {/* Error message */}
                                    {error && (
                                        <div
                                            className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                                                error.isLocked
                                                    ? "bg-orange-50 border border-orange-200 text-orange-700"
                                                    : error.remainingAttempts !==
                                                            undefined &&
                                                        error.remainingAttempts <=
                                                            2
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
                                                        ⚠️{" "}
                                                        {
                                                            error.remainingAttempts
                                                        }{" "}
                                                        out of{" "}
                                                        {error.maxAttempts}{" "}
                                                        attempts remaining
                                                    </p>
                                                )}
                                                {error.hoursRemaining !==
                                                    undefined && (
                                                    <p className="text-xs mt-1 font-medium">
                                                        🔒 Try again in{" "}
                                                        {error.hoursRemaining}{" "}
                                                        {error.hoursRemaining ===
                                                        1
                                                            ? "hour"
                                                            : "hours"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* OTP Input Fields */}
                                    <div className="flex justify-center gap-2 mb-6">
                                        {verificationCode.map(
                                            (digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`code-${index}`}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) =>
                                                        handleCodeChange(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(index, e)
                                                    }
                                                    onPaste={handlePaste}
                                                    disabled={shouldDisableInputs()}
                                                    className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none ${
                                                        shouldDisableInputs()
                                                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                            : error?.remainingAttempts !==
                                                                    undefined &&
                                                                error.remainingAttempts <=
                                                                    2
                                                              ? "border-red-300 bg-red-50"
                                                              : "border-gray-300"
                                                    }`}
                                                    autoFocus={
                                                        index === 0 &&
                                                        !shouldDisableInputs()
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>

                                    {/* Verify Button */}
                                    <button
                                        onClick={handleVerify}
                                        disabled={isLoading || isOtpExpired()}
                                        className={`w-full py-2 rounded-lg font-semibold transition mb-4 ${
                                            isLoading || isOtpExpired()
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-brand text-white hover:bg-brand-dark"
                                        }`}
                                    >
                                        {isLoading
                                            ? "Verifying..."
                                            : "Verify Email"}
                                    </button>

                                    {/* Resend Button */}
                                    {isOtpExpired() && (
                                        <div className="text-center text-sm">
                                            <span className="text-gray-500">
                                                Didn't receive the code?{" "}
                                            </span>
                                            <button
                                                onClick={handleResendCode}
                                                disabled={isResendDisabled()}
                                                className={`font-medium ${
                                                    isResendDisabled()
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-brand hover:underline"
                                                }`}
                                            >
                                                {getResendButtonText()}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <CheckCircle className="w-12 h-12 text-green-600" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                                        Email Verified!
                                    </h2>
                                    <p className="text-gray-500 text-center text-sm mb-6">
                                        Your email has been successfully
                                        verified.
                                    </p>
                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5 }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
