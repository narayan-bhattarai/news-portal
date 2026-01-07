
// Web Crypto API Wrapper for E2EE

// Helper: ArrayBuffer to Base64
function ab2str(buf: ArrayBuffer | ArrayBufferView): string {
    const bytes = ArrayBuffer.isView(buf) ?
        new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) :
        new Uint8Array(buf);
    return btoa(String.fromCharCode(...bytes));
}

// Helper: Base64 to ArrayBuffer
function str2ab(str: string): ArrayBuffer {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Generate an RSA-OAEP key pair
export async function generateKeyPair() {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// Export Key to JWK format (string) for storage/transmission
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return JSON.stringify(exported);
}

// Import Key from JWK string
export async function importKey(jwkJson: string, type: "public" | "private"): Promise<CryptoKey> {
    const jwk = JSON.parse(jwkJson);
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        [type === "public" ? "encrypt" : "decrypt"]
    );
}

// Hybrid Encryption: AES-GCM + RSA-OAEP
export async function encryptMessage(text: string, publicKey: CryptoKey): Promise<string> {
    try {
        // 1. Generate a one-time AES-GCM key
        const aesKey = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        // 2. Encrypt the actual message with AES
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const encryptedData = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            data
        );

        // 3. Export the AES key
        const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

        // 4. Encrypt the AES key with the recipient's RSA Public Key
        const encryptedKey = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            rawAesKey
        );

        // 5. Package it all up
        const payload = {
            v: 1, // Version 1 (Hybrid)
            iv: ab2str(iv),
            k: ab2str(encryptedKey), // Encrypted AES Key
            d: ab2str(encryptedData) // Encrypted Data
        };

        return JSON.stringify(payload);
    } catch (e) {
        console.error("Encryption error:", e);
        throw e;
    }
}

// Decrypt text using a Private Key (Support Hybrid & Legacy)
export async function decryptMessage(cipherText: string, privateKey: CryptoKey): Promise<string> {
    try {
        // Try parsing as JSON (New Hybrid Format)
        if (cipherText.startsWith('{') && cipherText.includes('"v":1')) {
            try {
                const payload = JSON.parse(cipherText);

                // 1. Decrypt the AES Key using RSA Private Key
                const rawAesKey = await window.crypto.subtle.decrypt(
                    { name: "RSA-OAEP" },
                    privateKey,
                    str2ab(payload.k)
                );

                // 2. Import the decrypted AES Key
                const aesKey = await window.crypto.subtle.importKey(
                    "raw",
                    rawAesKey,
                    "AES-GCM",
                    false,
                    ["decrypt"]
                );

                // 3. Decrypt the Data using AES Key
                const decryptedData = await window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: str2ab(payload.iv) },
                    aesKey,
                    str2ab(payload.d)
                );

                return new TextDecoder().decode(decryptedData);
            } catch (jsonError) {
                console.warn("Hybrid decryption failed, attempting legacy...", jsonError);
                // Fallthrough to legacy
            }
        }

        // Legacy Fallback: Direct RSA Decryption
        // (For messages sent before this update or if JSON parse failed)
        const bytes = str2ab(cipherText);
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            bytes
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);

    } catch (e) {
        console.error("Decryption failed", e);
        return "[Encrypted Message]";
    }
}
