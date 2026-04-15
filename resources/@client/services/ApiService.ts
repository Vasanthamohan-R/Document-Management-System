import axios from "axios";
import { decrypt } from "@/utils/crypto";

/**
 * ApiService
 *
 * Centrally manages all API requests, authentication headers,
 * error handling, and automated data decryption.
 */
const ApiService = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Request Interceptor: Attach Auth Token
ApiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

ApiService.interceptors.response.use(
    async (response) => {
        if (response.data && response.data.status === "success") {
            const apiData = response.data.data;
            if (typeof apiData === "string" && apiData.length > 0) {
                try {
                    const decrypted = await decrypt(apiData);
                    if (
                        decrypted !== null &&
                        typeof decrypted === "object" &&
                        !Array.isArray(decrypted)
                    ) {
                        response.data = { ...response.data, ...decrypted };
                    } else {
                        response.data.data = decrypted;
                    }
                } catch (err) {
                    console.error("Global Decryption Error:", err);
                }
            }
        }
        return response;
    },
    async (error) => {
        // Handle different types of errors
        if (error.response?.status === 401) {
            // Unauthorized - Redirect to login
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        } else if (error.response?.status === 429) {
            // Rate limiting
            console.warn("Rate limit exceeded:", error.response.data);
        } else if (error.response?.status >= 500) {
            // Server errors
            console.error("Server error:", error.response.data);
        } else if (error.response?.status === 403) {
            // Check if it's an email verification error
            const errorData = error.response.data;
            if (errorData?.errors?.email_verified === false) {
                console.info("Email verification required:", errorData);
            }
        }

        return Promise.reject(error);
    },
);

export default ApiService;
