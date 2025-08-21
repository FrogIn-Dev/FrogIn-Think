import type { FirebaseError } from 'firebase/app';

type Locale = 'en';

const MESSAGES: Record<string, { en: string }> = {
  // Auth génériques
  'auth/invalid-credential': {
    en: "Sorry, your email or password is incorrect."
  },
  'auth/invalid-email': {
    en: "Invalid email format."
  },
  'auth/user-disabled': {
    en: "This account has been disabled."
  },
  'auth/user-not-found': {
    en: "No user found with that email."
  },
  'auth/wrong-password': {
    en: "Incorrect password."
  },
  'auth/too-many-requests': {
    en: "Too many attempts. Please try again later."
  },
  'auth/network-request-failed': {
    en: "Network error. Check your connection."
  },
  'auth/operation-not-allowed': {
    en: "Operation not allowed (sign-in method disabled)."
  },
  'auth/requires-recent-login': {
    en: "Please reauthenticate and try again."
  },

  // Register
  'auth/email-already-in-use': {
    en: "That email is already in use."
  },
  'auth/weak-password': {
    en: "Password too weak (8+ chars, upper/lower, number, symbol)."
  },

  // Update email
  'auth/timeout': {
    en: "The request timed out. Please try again."
  },

  // Firestore (au cas où)
  'permission-denied': {
    en: "Permission denied by security rules."
  },
};

export function mapFirebaseError(err: unknown, locale: Locale = 'en'): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as FirebaseError).code)
      : '';

  if (code && MESSAGES[code]) return MESSAGES[code][locale];

  // Fallback: message générique + code si dispo
  const base = "Something went wrong. Please try again.";
  return code ? `${base} [${code}]` : base;
}
