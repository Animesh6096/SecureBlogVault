// Client-side encryption utilities - used for secure data handling
// Note: This is just for additional data security and isn't meant to replace server-side encryption

/**
 * Encrypt data client-side before sending to server 
 * This adds an extra layer of security but the primary encryption happens server-side
 */
export async function encryptClientData(data: string, key: string): Promise<string> {
  try {
    // Convert the key and data to proper formats for Web Crypto API
    const encodedKey = new TextEncoder().encode(key);
    const encodedData = new TextEncoder().encode(data);
    
    // Import the key
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      encodedKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Generate a random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      encodedData
    );
    
    // Combine IV and encrypted data and convert to Base64
    const encryptedArray = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
    encryptedArray.set(iv, 0);
    encryptedArray.set(new Uint8Array(encryptedBuffer), iv.byteLength);
    
    return btoa(String.fromCharCode(...encryptedArray));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data client-side after receiving from server
 * This handles data that might have been pre-encrypted client-side
 */
export async function decryptClientData(encryptedData: string, key: string): Promise<string> {
  try {
    // Convert Base64 back to array buffer
    const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = encryptedBytes.slice(0, 12);
    const data = encryptedBytes.slice(12);
    
    // Import the key
    const encodedKey = new TextEncoder().encode(key);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      encodedKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      data
    );
    
    // Convert the decrypted data back to a string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
