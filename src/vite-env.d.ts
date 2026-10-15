/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** Local testing only: send the form to the Firestore emulator on this host:port. */
  readonly VITE_FIRESTORE_EMULATOR?: string
}
