/**
 * Authentication Configuration
 * 
 * Controls which auth providers are visible on the login screen.
 * Backend capabilities remain intact - only UI visibility is affected.
 */

export const AUTH_PROVIDERS_ENABLED = {
  emailPassword: true,   // Email + Password login
  google: false,         // Continue with Google
  phone: false,          // Continue with Phone (SMS OTP)
  magicLink: false,      // Continue with Email (Magic Link)
} as const;

export type AuthProvider = keyof typeof AUTH_PROVIDERS_ENABLED;

/**
 * Check if a specific auth provider is enabled
 */
export function isAuthProviderEnabled(provider: AuthProvider): boolean {
  return AUTH_PROVIDERS_ENABLED[provider];
}

/**
 * Get list of enabled providers
 */
export function getEnabledProviders(): AuthProvider[] {
  return (Object.keys(AUTH_PROVIDERS_ENABLED) as AuthProvider[])
    .filter(provider => AUTH_PROVIDERS_ENABLED[provider]);
}
