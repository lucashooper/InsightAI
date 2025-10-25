// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Check if Google OAuth is configured
export const isGoogleOAuthConfigured = (): boolean => {
  return Boolean(GOOGLE_CLIENT_ID);
};

// Log configuration status (for debugging)
if (import.meta.env.DEV) {
  console.log('Google OAuth Configuration:', {
    clientIdConfigured: isGoogleOAuthConfigured(),
    clientIdPrefix: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'Not set'
  });
}
