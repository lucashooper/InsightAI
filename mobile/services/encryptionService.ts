import Aes from 'react-native-aes-crypto';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_KEY = 'insight_encryption_key';

let cachedKey: string | null | undefined;

export class EncryptionService {
  /**
   * Generate encryption key from user password
   * Uses PBKDF2 with 10,000 iterations for security
   * Uses react-native-aes-crypto for native implementation
   */
  static async generateKey(password: string, userId: string): Promise<string> {
    // Use PBKDF2 to derive a 256-bit key from password
    // pbkdf2(password, salt, iterations, keyLength, algorithm)
    const key = await Aes.pbkdf2(password, userId, 10000, 256, 'sha512');
    console.log('[Encryption] Key generated using PBKDF2');
    return key;
  }

  /**
   * Store encryption key in secure storage
   * Uses expo-secure-store (encrypted, protected by device security)
   */
  static async storeKey(key: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, key);
      cachedKey = key;
      console.log('[Encryption] Key stored in secure storage');
    } catch (error) {
      console.error('[Encryption] Failed to store key:', error);
      throw new Error('Failed to store encryption key');
    }
  }

  /**
   * Retrieve encryption key from secure storage
   */
  static async getKey(): Promise<string | null> {
    if (cachedKey !== undefined) return cachedKey;
    try {
      const key = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      cachedKey = key;
      if (!key) {
        console.warn('[Encryption] No key found in secure storage');
      }
      return key;
    } catch (error) {
      console.error('[Encryption] Failed to retrieve key:', error);
      cachedKey = null;
      return null;
    }
  }

  /**
   * Initialize encryption key for user (call on signup/login)
   */
  static async initializeKey(password: string, userId: string): Promise<void> {
    const key = await this.generateKey(password, userId);
    await this.storeKey(key);
  }

  /**
   * Encrypt text using AES-256-CBC
   * Uses react-native-aes-crypto for native encryption
   */
  static async encrypt(text: string, key: string): Promise<string> {
    try {
      // Generate random IV using expo-crypto
      const ivBytes = await Crypto.getRandomBytesAsync(16);
      const iv = Array.from(ivBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Encrypt using native AES-256-CBC
      const encrypted = await Aes.encrypt(text, key, iv, 'aes-256-cbc');
      
      // Store IV with encrypted data (format: iv:encrypted)
      const result = `${iv}:${encrypted}`;
      console.log('[Encryption] Text encrypted successfully with AES-256-CBC');
      return result;
    } catch (error) {
      console.error('[Encryption] Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt text using AES-256-CBC
   * Handles both encrypted entries and legacy plain text entries
   */
  static async decrypt(encryptedText: string, key: string): Promise<string> {
    if (!encryptedText) {
      console.log('[Encryption] Empty content, returning empty string');
      return '';
    }

    // Check if content looks encrypted (format: iv:encrypted)
    const looksEncrypted = encryptedText.includes(':') && encryptedText.length > 32;
    
    if (!looksEncrypted) {
      console.log('[Encryption] Content does not look encrypted, treating as legacy plain text');
      return encryptedText; // Legacy entry, return as-is
    }

    try {
      // Split IV and encrypted data
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        console.warn('[Encryption] Invalid encrypted format, returning as plain text');
        return encryptedText;
      }
      
      const [iv, encrypted] = parts;
      
      // Decrypt using native AES-256-CBC
      const decrypted = await Aes.decrypt(encrypted, key, iv, 'aes-256-cbc');
      
      if (!decrypted) {
        console.warn('[Encryption] Decryption produced empty string, returning original');
        return encryptedText;
      }
      
      console.log('[Encryption] Successfully decrypted entry');
      return decrypted;
    } catch (error) {
      console.error('[Encryption] Decryption failed:', error);
      console.log('[Encryption] Returning original content as fallback (likely legacy plain text)');
      return encryptedText; // Fallback to original content
    }
  }

  /**
   * Clear encryption key from secure storage (call on logout)
   */
  static async clearKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
      cachedKey = undefined;
      console.log('[Encryption] Key cleared from secure storage');
    } catch (error) {
      console.error('[Encryption] Failed to clear key:', error);
    }
  }

  /**
   * Check if encryption key exists
   */
  static async hasKey(): Promise<boolean> {
    const key = await this.getKey();
    return key !== null;
  }

  /**
   * Test encryption functionality
   * Call this on app startup to verify encryption is working
   */
  static async testEncryption(): Promise<void> {
    console.log('[Encryption Test] Starting...');
    
    try {
      // Generate test key
      const testKey = await this.generateKey('test_password_123', 'test_user_id');
      console.log('[Encryption Test] Key generated:', testKey.substring(0, 10) + '...');
      
      // Test encryption
      const testText = 'Hello, this is a test entry!';
      const encrypted = await this.encrypt(testText, testKey);
      console.log('[Encryption Test] Encrypted:', encrypted.substring(0, 40) + '...');
      
      // Test decryption
      const decrypted = await this.decrypt(encrypted, testKey);
      console.log('[Encryption Test] Decrypted:', decrypted);
      
      // Verify
      if (decrypted === testText) {
        console.log('[Encryption Test] ✅ SUCCESS - Native AES-256 encryption working!');
      } else {
        console.error('[Encryption Test] ❌ FAILED - Decrypted text does not match');
        console.error('[Encryption Test] Expected:', testText);
        console.error('[Encryption Test] Got:', decrypted);
      }
      
      // Test legacy plain text handling
      const legacyText = 'This is a legacy plain text entry';
      const legacyDecrypted = await this.decrypt(legacyText, testKey);
      if (legacyDecrypted === legacyText) {
        console.log('[Encryption Test] ✅ Legacy plain text handling works');
      } else {
        console.error('[Encryption Test] ❌ Legacy handling failed');
      }
    } catch (error) {
      console.error('[Encryption Test] ❌ ERROR:', error);
    }
  }
}
