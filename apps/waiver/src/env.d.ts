/// <reference types="vite/client" />

// Project-specific ImportMeta.env typing for Vite env vars used in this app.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add other VITE_... env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
