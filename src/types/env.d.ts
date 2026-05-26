/// <reference types="vite/client" />

/**
 * Vite environment variable types.
 *
 * All env vars used by the frontend must be declared here AND prefixed
 * with VITE_ in the .env file. Vite only exposes VITE_-prefixed vars
 * to the client bundle.
 */
interface ImportMetaEnv {
  /** Backend API base URL. E.g. "http://localhost:5000" */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
