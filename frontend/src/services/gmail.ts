import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';

let app: any = null;
let auth: any = null;
let provider: any = null;
let initError: string | null = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
  } else {
    initError = "Firebase configuration is empty or missing. Please add the FIREBASE_CONFIG_JSON environment variable in your Vercel Dashboard.";
    console.warn(initError);
  }
} catch (e: any) {
  initError = e.message || String(e);
  console.error('[Firebase Init Error]', e);
}

export const getFirebaseInitError = (): string | null => {
  return initError;
};

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('Firebase Auth is not initialized. Please configure FIREBASE_CONFIG_JSON in Vercel.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  if (!auth) return;
  await auth.signOut();
  cachedAccessToken = null;
};

// Encode a string to base64url format
function base64urlEncode(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const sendEmail = async (to: string, subject: string, bodyText: string) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('User not authenticated with Google');
  }

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    bodyText
  ].join('\r\n');

  const encodedMessage = base64urlEncode(message);

  const res = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }

  return await res.json();
};
