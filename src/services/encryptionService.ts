/**
 * Zero-Knowledge End-to-End Encryption Service
 * 
 * Uses Web Crypto API for client-side encryption.
 * Password-based key derivation with PBKDF2.
 * AES-GCM encryption for notes.
 * 
 * IMPORTANT: Keys never leave the browser. Server stores only ciphertext.
 */

// Encryption configuration
const PBKDF2_ITERATIONS = 100000; // High iteration count for security
const KEY_LENGTH = 256; // AES-256
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM

interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
  salt: string; // Base64 encoded (stored per-user, not per-note)
}

interface DecryptedNote {
  title: string;
  content: string;
  ai_insights?: any;
}

class EncryptionService {
  private encryptionKey: CryptoKey | null = null;
  private userSalt: Uint8Array | null = null;

  /**
   * Initialize encryption with user's password
   * Call this after user logs in or enters encryption password
   */
  async initializeEncryption(password: string, saltBase64?: string): Promise<{ salt: string }> {
    // Generate or use existing salt
    if (saltBase64) {
      this.userSalt = this.base64ToUint8Array(saltBase64);
    } else {
      this.userSalt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    }

    // Derive encryption key from password
    const passwordKey = await this.getPasswordKey(password);
    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.userSalt as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      {
        name: 'AES-GCM',
        length: KEY_LENGTH
      },
      false, // Not extractable
      ['encrypt', 'decrypt']
    );

    console.log('✅ Encryption initialized');
    
    // Store encrypted flag in memory (not localStorage for security)
    sessionStorage.setItem('insightai-encryption-active', 'true');

    return {
      salt: this.uint8ArrayToBase64(this.userSalt)
    };
  }

  /**
   * Check if encryption is currently active in this session
   */
  isEncryptionActive(): boolean {
    return this.encryptionKey !== null && sessionStorage.getItem('insightai-encryption-active') === 'true';
  }

  /**
   * Clear encryption key from memory (logout)
   */
  clearEncryption(): void {
    this.encryptionKey = null;
    this.userSalt = null;
    sessionStorage.removeItem('insightai-encryption-active');
    console.log('🔒 Encryption cleared from memory');
  }

  /**
   * Encrypt a note before storing
   */
  async encryptNote(note: DecryptedNote): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. User must unlock vault first.');
    }

    const noteJson = JSON.stringify(note);
    const noteBuffer = new TextEncoder().encode(noteJson);

    // Generate random IV for this encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      this.encryptionKey,
      noteBuffer as BufferSource
    );

    // Return as JSON with IV (salt is per-user, stored separately)
    const encrypted: EncryptedData = {
      ciphertext: this.arrayBufferToBase64(ciphertext),
      iv: this.uint8ArrayToBase64(iv),
      salt: this.userSalt ? this.uint8ArrayToBase64(this.userSalt) : ''
    };

    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt a note after fetching
   */
  async decryptNote(encryptedData: string): Promise<DecryptedNote> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. User must unlock vault first.');
    }

    const encrypted: EncryptedData = JSON.parse(encryptedData);
    
    const ciphertext = this.base64ToArrayBuffer(encrypted.ciphertext);
    const iv = this.base64ToUint8Array(encrypted.iv);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      this.encryptionKey,
      ciphertext as BufferSource
    );

    const decryptedText = new TextDecoder().decode(decrypted);
    return JSON.parse(decryptedText);
  }

  /**
   * Generate a recovery key (backup in case user forgets password)
   * User should write this down and store safely
   */
  generateRecoveryKey(): string {
    const recoveryBytes = crypto.getRandomValues(new Uint8Array(32)); // 256 bits
    const recoveryKey = this.uint8ArrayToBase64(recoveryBytes);
    
    // Format as readable chunks (like Bitcoin seed phrases)
    const chunks = recoveryKey.match(/.{1,4}/g) || [];
    return chunks.join('-');
  }

  /**
   * Verify password is correct by attempting to decrypt a test payload
   */
  async verifyPassword(password: string, saltBase64: string, testEncryptedData: string): Promise<boolean> {
    try {
      // Temporarily derive key
      const salt = this.base64ToUint8Array(saltBase64);
      const passwordKey = await this.getPasswordKey(password);
      const testKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt as BufferSource,
          iterations: PBKDF2_ITERATIONS,
          hash: 'SHA-256'
        },
        passwordKey,
        {
          name: 'AES-GCM',
          length: KEY_LENGTH
        },
        false,
        ['decrypt']
      );

      // Try to decrypt test data
      const encrypted: EncryptedData = JSON.parse(testEncryptedData);
      const ciphertext = this.base64ToArrayBuffer(encrypted.ciphertext);
      const iv = this.base64ToUint8Array(encrypted.iv);

      await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource
        },
        testKey,
        ciphertext as BufferSource
      );

      return true; // Success
    } catch (error) {
      return false; // Wrong password
    }
  }

  /**
   * Create a test encrypted payload for password verification
   */
  async createTestPayload(): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    const testData = { test: 'verification_payload', timestamp: Date.now() };
    return await this.encryptNote(testData as any);
  }

  // ========== UTILITY FUNCTIONS ==========

  private async getPasswordKey(password: string): Promise<CryptoKey> {
    const passwordBuffer = new TextEncoder().encode(password);
    return await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    const binString = Array.from(bytes, (byte) =>
      String.fromCodePoint(byte)
    ).join('');
    return btoa(binString);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (char) => char.codePointAt(0)!);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return this.uint8ArrayToBase64(new Uint8Array(buffer));
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    return this.base64ToUint8Array(base64).buffer as ArrayBuffer;
  }

  /**
   * Export vault data as encrypted backup
   */
  async exportEncryptedVault(notes: any[]): Promise<Blob> {
    const vaultData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      notes: notes,
      salt: this.userSalt ? this.uint8ArrayToBase64(this.userSalt) : null
    };

    const vaultJson = JSON.stringify(vaultData, null, 2);
    return new Blob([vaultJson], { type: 'application/json' });
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
