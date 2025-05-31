import { randomBytes, createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

// Key settings
const KEY_LENGTH = 32; // 256 bits
const KEY_FILE = path.join(process.cwd(), '.key');
const KEY_ENV_VAR = 'ENCRYPTION_KEY';

// Key rotation settings
const MAX_KEY_AGE_DAYS = 30;
let currentKey: Buffer | null = null;

/**
 * Gets the current encryption key, creating one if it doesn't exist
 * 
 * @returns The encryption key as a Buffer
 */
export function getEncryptionKey(): Buffer {
  // If we already have a key loaded, return it
  if (currentKey) {
    return currentKey;
  }

  try {
    // Check if the key is in the environment variables (preferable for production)
    if (process.env[KEY_ENV_VAR]) {
      // Convert hex string to Buffer
      currentKey = Buffer.from(process.env[KEY_ENV_VAR], 'hex');
      return currentKey;
    }

    // If not in the environment, try to read from the key file
    if (fs.existsSync(KEY_FILE)) {
      // Read the key and its creation date
      const keyData = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
      const keyCreationDate = new Date(keyData.created);
      const keyAge = (Date.now() - keyCreationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // If the key is too old, rotate it
      if (keyAge > MAX_KEY_AGE_DAYS) {
        console.log('Encryption key is older than 30 days, rotating...');
        return rotateKey();
      }
      
      currentKey = Buffer.from(keyData.key, 'hex');
      return currentKey;
    }

    // If no key exists, create a new one
    return generateNewKey();
  } catch (error) {
    console.error('Error getting encryption key:', error);
    
    // If there's an error, generate a new key
    return generateNewKey();
  }
}

/**
 * Generate a new encryption key and save it
 * 
 * @returns The new encryption key as a Buffer
 */
function generateNewKey(): Buffer {
  try {
    // Generate a random key
    const key = randomBytes(KEY_LENGTH);
    
    // Save the key data
    const keyData = {
      key: key.toString('hex'),
      created: new Date().toISOString()
    };
    
    // If not in production, save to a file for development
    if (process.env.NODE_ENV !== 'production') {
      fs.writeFileSync(KEY_FILE, JSON.stringify(keyData), { mode: 0o600 }); // restrictive permissions
      console.log('New encryption key generated and saved to file');
    } else {
      console.log('New encryption key generated, should be set as an environment variable in production');
    }
    
    currentKey = key;
    return key;
  } catch (error) {
    console.error('Error generating new key:', error);
    
    // In case of error, still return a usable key
    const emergencyKey = createHash('sha256').update(Date.now().toString()).digest();
    currentKey = emergencyKey;
    return emergencyKey;
  }
}

/**
 * Rotate the encryption key
 * 
 * @returns The new encryption key as a Buffer
 */
function rotateKey(): Buffer {
  try {
    // In a real application, you would:
    // 1. Generate a new key
    const newKey = randomBytes(KEY_LENGTH);
    
    // 2. Re-encrypt all sensitive data with the new key
    // This would involve fetching all encrypted data, decrypting with the old key,
    // and re-encrypting with the new key. This is complex and requires a well-designed system.
    console.log('Key rotation: in a production app, all encrypted data would need to be re-encrypted here');
    
    // 3. Save the new key
    const keyData = {
      key: newKey.toString('hex'),
      created: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV !== 'production') {
      fs.writeFileSync(KEY_FILE, JSON.stringify(keyData), { mode: 0o600 });
    }
    
    console.log('Encryption key has been rotated');
    
    currentKey = newKey;
    return newKey;
  } catch (error) {
    console.error('Error rotating key:', error);
    
    // If rotation fails, generate a new key but log the error
    return generateNewKey();
  }
}

/**
 * Derive a key for a specific purpose to prevent using the same key everywhere
 * 
 * @param purpose The purpose identifier for the key (e.g., 'user_data', 'posts')
 * @returns A Buffer containing the derived key
 */
export function deriveKeyForPurpose(purpose: string): Buffer {
  const masterKey = getEncryptionKey();
  const hmac = createHash('sha256').update(`${purpose}:${masterKey.toString('hex')}`).digest();
  return hmac;
}

/**
 * Derive a unique key for a specific user using the master key.
 *
 * @param userId The unique identifier for the user
 * @returns A Buffer containing the derived key for the user
 */
export function deriveKeyForUser(userId: string): Buffer {
  const masterKey = getEncryptionKey();
  // Combine userId and masterKey to derive a unique key for each user
  const derivedKey = createHash('sha256').update(`${userId}:${masterKey.toString('hex')}`).digest();
  return derivedKey;
}
