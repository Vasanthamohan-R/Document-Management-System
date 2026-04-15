/**
 * AES-256-GCM Decryption Utility
 * 
 * This utility provides secure decryption compatible with the PHP openssl_encrypt implementation.
 * It uses the built-in Web Crypto API for high performance and security.
 */

/**
 * Decrypts a base64 encoded string using AES-256-GCM
 * Format: base64(iv):base64(tag):base64(ciphertext)
 */
export const decrypt = async (payload: string): Promise<any> => {
    try {
        const secret = import.meta.env.VITE_CLIENT_SECRET;
        if (!secret) {
            throw new Error("VITE_CLIENT_SECRET is not defined in the environment.");
        }

        // ✅ Decode full payload (iv + tag + ciphertext)
        const raw = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));

        // ✅ Match PHP constants
        const IV_LENGTH = 12;
        const TAG_LENGTH = 16;

        // ✅ Extract parts
        const iv = raw.slice(0, IV_LENGTH);
        const tag = raw.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
        const ciphertext = raw.slice(IV_LENGTH + TAG_LENGTH);

        // ✅ Combine ciphertext + tag (Web Crypto requirement)
        const combined = new Uint8Array(ciphertext.length + tag.length);
        combined.set(ciphertext);
        combined.set(tag, ciphertext.length);

        // ✅ Derive key (same as PHP)
        const encoder = new TextEncoder();
        const secretData = encoder.encode(secret);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", secretData);

        const key = await window.crypto.subtle.importKey(
            "raw",
            hashBuffer,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // ✅ Decrypt
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
                tagLength: 128,
            },
            key,
            combined
        );

        const decoder = new TextDecoder();
        const decryptedText = decoder.decode(decryptedBuffer);

        try {
            return JSON.parse(decryptedText);
        } catch {
            return decryptedText;
        }

    } catch (error) {
        console.error("GCM Decryption failed:", error);
        throw error;
    }
};
