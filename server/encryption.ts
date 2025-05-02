import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { getEncryptionKey } from './key-management';

// Encryption algorithm and IV length
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts data using AES-256-GCM
 * 
 * @param data The data to encrypt
 * @returns Encrypted data in the format: iv.authTag.encryptedData (base64 encoded)
 */
export function encryptData(data: string): string {
  try {
    // Get the encryption key
    const key = getEncryptionKey();
    
    // Generate a random initialization vector
    const iv = randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get the auth tag (for GCM mode)
    const authTag = cipher.getAuthTag();
    
    // Format: iv.authTag.encryptedData (all base64 encoded)
    const result = [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted
    ].join('.');
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data that was encrypted with encryptData
 * 
 * @param encryptedData The encrypted data in the format: iv.authTag.encryptedData (base64 encoded)
 * @returns The decrypted data as a string
 */
export function decryptData(encryptedData: string): string {
  try {
    // Get the encryption key
    const key = getEncryptionKey();
    
    // Split the parts: iv.authTag.encryptedData
    const parts = encryptedData.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encryptedText = parts[2];
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    
    // For security, just throw a generic error
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a Message Authentication Code (MAC) for data integrity verification
 * 
 * @param data The data to generate a MAC for
 * @returns The MAC as a base64 string
 */
export function generateMAC(data: string): string {
  const { createHmac } = require('crypto');
  const key = getEncryptionKey();
  
  // Create HMAC using SHA-256
  const hmac = createHmac('sha256', key);
  hmac.update(data);
  
  return hmac.digest('base64');
}

/**
 * Verify data integrity using a MAC
 * 
 * @param data The data to verify
 * @param mac The MAC to verify against
 * @returns True if the MAC is valid, false otherwise
 */
export function verifyMAC(data: string, mac: string): boolean {
  try {
    const calculatedMAC = generateMAC(data);
    
    // Use a constant-time comparison to prevent timing attacks
    const { timingSafeEqual } = require('crypto');
    const macBuffer = Buffer.from(mac, 'base64');
    const calculatedMacBuffer = Buffer.from(calculatedMAC, 'base64');
    
    return timingSafeEqual(macBuffer, calculatedMacBuffer);
  } catch (error) {
    console.error('MAC verification error:', error);
    return false;
  }
}
