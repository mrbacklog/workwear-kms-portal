import { kmsApiBase } from './kms-theme';

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function isPasskeyAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;
  try {
    if (typeof PublicKeyCredential.isConditionalMediationAvailable === 'function') {
      const available = await PublicKeyCredential.isConditionalMediationAvailable();
      return available;
    }
    return true;
  } catch {
    return false;
  }
}

export async function registerPasskey(authToken: string, deviceName?: string): Promise<boolean> {
  try {
    const optionsRes = await fetch(`${kmsApiBase}/api/v1/kms/auth/passkey/register-options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ device_name: deviceName }),
    });
    if (!optionsRes.ok) return false;

    const { options, challenge_token } = await optionsRes.json() as {
      options: {
        challenge: string;
        rp: { name: string; id?: string };
        user: { id: string; name: string; displayName: string };
        pubKeyCredParams: PublicKeyCredentialParameters[];
        timeout?: number;
        excludeCredentials?: { id: string; type: string; transports?: AuthenticatorTransport[] }[];
        authenticatorSelection?: AuthenticatorSelectionCriteria;
        attestation?: AttestationConveyancePreference;
      };
      challenge_token: string;
    };

    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: base64urlToBuffer(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      timeout: options.timeout,
      excludeCredentials: options.excludeCredentials?.map((c) => ({
        id: base64urlToBuffer(c.id),
        type: c.type as PublicKeyCredentialType,
        transports: c.transports,
      })),
      authenticatorSelection: options.authenticatorSelection,
      attestation: options.attestation,
    };

    const credential = await navigator.credentials.create({ publicKey });
    if (!credential || !(credential instanceof PublicKeyCredential)) return false;

    const response = credential.response as AuthenticatorAttestationResponse;

    const credentialPayload = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: 'public-key',
      response: {
        attestationObject: bufferToBase64url(response.attestationObject),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
      },
    };

    const registerRes = await fetch(`${kmsApiBase}/api/v1/kms/auth/passkey/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ credential: credentialPayload, challenge_token }),
    });

    return registerRes.ok;
  } catch {
    return false;
  }
}

export async function authenticateWithPasskey(email?: string): Promise<{
  access_token: string;
  refresh_token?: string;
  customer_name: string;
  customer_slug: string;
  expires_in: number;
} | null> {
  try {
    const optionsRes = await fetch(`${kmsApiBase}/api/v1/kms/auth/passkey/auth-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!optionsRes.ok) return null;

    const { options, challenge_token } = await optionsRes.json() as {
      options: {
        challenge: string;
        timeout?: number;
        rpId?: string;
        allowCredentials?: { id: string; type: string; transports?: AuthenticatorTransport[] }[];
        userVerification?: UserVerificationRequirement;
      };
      challenge_token: string;
    };

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: base64urlToBuffer(options.challenge),
      timeout: options.timeout,
      rpId: options.rpId,
      allowCredentials: options.allowCredentials?.map((c) => ({
        id: base64urlToBuffer(c.id),
        type: c.type as PublicKeyCredentialType,
        transports: c.transports,
      })),
      userVerification: options.userVerification,
    };

    const credential = await navigator.credentials.get({ publicKey });
    if (!credential || !(credential instanceof PublicKeyCredential)) return null;

    const response = credential.response as AuthenticatorAssertionResponse;

    const credentialPayload = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: 'public-key',
      response: {
        authenticatorData: bufferToBase64url(response.authenticatorData),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        signature: bufferToBase64url(response.signature),
        userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
      },
    };

    const authRes = await fetch(`${kmsApiBase}/api/v1/kms/auth/passkey/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: credentialPayload, challenge_token }),
    });

    if (!authRes.ok) return null;

    return await authRes.json() as {
      access_token: string;
      refresh_token?: string;
      customer_name: string;
      customer_slug: string;
      expires_in: number;
    };
  } catch {
    return null;
  }
}
