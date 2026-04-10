import axios from "axios";
import { Alert } from "@/utils/Alert/Alert";

interface TokenResponse {
    status: string;
    code: number;
    message: string;
    data: {
        token: string;
        expires_in: number;
    };
}

const auth = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * --------------------------------------------------------------------------------
 * Generate Client Token
 * --------------------------------------------------------------------------------
 * Generates a new client token and stores it in localStorage
 * @returns Promise<boolean> - Returns true if token generated successfully
 * --------------------------------------------------------------------------------
 */
export const generateClientToken = async (): Promise<boolean> => {
    try {
        const response = await axios.post<TokenResponse>(
            `${import.meta.env.VITE_API_URL}/client/token/generate`,
            { client_id: import.meta.env.VITE_CLIENT_ID },
        );

        const { token: newToken, expires_in } = response.data.data;
        const expiryTime = Date.now() + expires_in * 1000;

        localStorage.setItem("client_token", newToken);
        localStorage.setItem("token_expiry", expiryTime.toString());

        console.log("✅ Client token generated successfully", {
            expiresAt: new Date(expiryTime).toLocaleString(),
        });
        return true;
    } catch (error) {
        console.error("❌ Failed to generate client token:", error);
        Alert.Error("Unable to authenticate. Please refresh the page.");
        return false;
    }
};

/**
 * --------------------------------------------------------------------------------
 * Ensure Valid Client Token
 * --------------------------------------------------------------------------------
 * Checks if client token exists and is valid (not expiring within 2 minutes).
 * If token is missing or expiring soon, generates a new token.
 * @returns Promise<boolean> - Returns true if token is valid
 * --------------------------------------------------------------------------------
 */
export const ensureValidClientToken = async (): Promise<boolean> => {
    const token = localStorage.getItem("client_token");
    const expiry = localStorage.getItem("token_expiry");

    console.log("🔐 Client token check:", {
        hasToken: !!token,
        hasExpiry: !!expiry,
        expiryTime: expiry ? new Date(Number(expiry)).toLocaleString() : null,
    });

    // Check if we need a new token
    let needsNewToken = false;

    if (!token || !expiry) {
        console.log("🆕 No client token found, generating new token...");
        needsNewToken = true;
    } else {
        const expiryTime = Number(expiry);
        const now = Date.now();
        const minutesLeft = (expiryTime - now) / (1000 * 60);

        console.log("⏰ Client token expiry:", {
            minutesLeft: minutesLeft.toFixed(2),
            expiresAt: new Date(expiryTime).toLocaleString(),
        });

        if (minutesLeft < 2) {
            console.log(
                "🔄 Client token expiring soon (< 2 min), refreshing...",
            );
            needsNewToken = true;
        }
    }

    // Generate new token if needed
    if (needsNewToken) {
        return await generateClientToken();
    }

    console.log("✅ Client token is valid");
    return true;
};

/**
 * --------------------------------------------------------------------------------
 * Request Interceptor - Attach Access Token
 * --------------------------------------------------------------------------------
 * Adds the access token to the Authorization header for authenticated requests
 * --------------------------------------------------------------------------------
 */
auth.interceptors.request.use(
    async (config) => {
        // For client token requests, skip adding the client token itself
        if (config.url?.includes("/client/token/generate")) {
            return config;
        }

        // For authenticated requests, add access token
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // For non-auth endpoints, ensure client token is valid
        // Check if this endpoint requires client token
        const requiresClientToken = true;
        //     //   !config.url?.includes("/auth/login") &&
        //       !config.url?.includes("/auth/password/request");
        if (requiresClientToken) {
            const isValid = await ensureValidClientToken();
            if (!isValid) {
                // Cancel the request if token is invalid
                return Promise.reject(new Error("Unable to authenticate"));
            }
            const clientToken = localStorage.getItem("client_token");
            if (clientToken) {
                config.headers["X-CLIENT-TOKEN"] = clientToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * --------------------------------------------------------------------------------
 * Response Interceptor - Handle Token Expiration
 * --------------------------------------------------------------------------------
 * Handles token expiration and redirects to login when needed
 * --------------------------------------------------------------------------------
 */
auth.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ✅ Skip refresh logic for auth endpoints
        const isAuthEndpoint =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/verify-otp") ||
            originalRequest.url?.includes("/auth/resend-otp") ||
            originalRequest.url?.includes("/auth/password");

        if (isAuthEndpoint) {
            return Promise.reject(error); // ✅ pass error directly to the caller
        }

        // Handle 401 Unauthorized (access token expired) — only for protected routes
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_URL}/auth/refresh/token`,
                        { refresh_token: refreshToken, platform: "web" },
                    );

                    if (response.data.status === "success") {
                        localStorage.setItem(
                            "access_token",
                            response.data.data.access_token,
                        );
                        localStorage.setItem(
                            "refresh_token",
                            response.data.data.refresh_token,
                        );
                        originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
                        return auth(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Refresh token failed:", refreshError);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/";
                }
            } else {
                localStorage.removeItem("access_token");
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    },
);
export default auth;
