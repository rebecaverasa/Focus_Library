/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL; defaults to http://localhost:8000 when unset. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
